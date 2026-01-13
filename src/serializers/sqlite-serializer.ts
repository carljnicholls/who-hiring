import { DatabaseSync } from "node:sqlite";
import { BaseSerializer } from "./base-serializer";
import { Temporal } from "@js-temporal/polyfill";

export class SqlLiteSerializer extends BaseSerializer {
    serialize<T>(data: T, options?: any): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.serializeToSqlLite<T>(data, options);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    private serializeToSqlLite<T>(data: T, options?: any): void {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                const errMsg =
                    "SQLite serialization requires a non-empty array of objects.";
                this.logger.error(errMsg);
                throw new Error(errMsg);
            }

            this.logger.log("Starting SQLite serialization...");
            this.initSqlLiteSchema(options);

            this.logger.log("Inserting data into SQLite database...");
            for (const item of data) {
                try {
                    const db = new DatabaseSync(
                        options?.databasePath || "output.db"
                    );

                    const postAuditId = this.insertAudit(
                        db,
                        item.time,
                        item.by
                    );
                    // this.logger.log("Inserted Audit with ID: ", postAuditId);

                    const postId = this.insertPost(db, item, postAuditId);

                    if (item.comments && Array.isArray(item.comments)) {
                        this.insertRecursiveComments(db, item.comments, postId);
                    }

                    db.close();
                } catch (error) {
                    this.logger.error(
                        "Error inserting item into SQLite database:",
                        error
                    );
                    throw error;
                }
            }
        } catch (error) {
            this.logger.error("Error during SQLite serialization:", error);
            throw error;
        }
    }

    private insertPost(
        db: DatabaseSync,
        item: any,
        postAuditId: number | bigint
    ) {
        const postsQuery = db.prepare(
            `INSERT INTO Posts (title, score, hn_id, descendants, audit_id) VALUES (?, ?, ?, ?, ?)`
        );
        const postResult = postsQuery.run(
            item.title,
            item.score,
            item.id,
            item.descendants,
            postAuditId
        );

        const postId = postResult.lastInsertRowid;
        if (!postId) {
            const errMsg = "Failed to retrieve last inserted Post ID";
            this.logger.error(errMsg, item);
            throw new Error(errMsg, item);
        }
        this.logger.log("Inserted Post with ID: ", postId);
        return postId;
    }

    private insertRecursiveComments(
        db: DatabaseSync,
        comments: any[],
        postId: number | bigint | undefined
    ): void {
        for (const comment of comments) {
            this.insertComment(comment, db, postId);

            if (comment.children && comment.children.length > 0) {
                this.insertRecursiveComments(db, comment.children, undefined);
            }
        }
    }

    private insertComment(
        comment: any,
        db: DatabaseSync,
        postId: number | bigint | undefined
    ): void {
        this.logger.log(
            "Inserting audit: ",
            comment.time,
            comment.by ?? "unknown"
        );
        const postAuditId = this.insertAudit(db, comment.time, comment.by);
        this.logger.log("Inserted Audit with ID: ", postAuditId);
        const commentsQuery = db.prepare(
            `INSERT INTO Comments (hn_id, score, title, type, text, post_parent_id, comment_parent_id, audit_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        const commentResult = commentsQuery.run(
            comment.id,
            comment.score ?? null,
            comment.title ?? null,
            comment.type,
            comment.text ?? null,
            postId ?? null,
            comment.parent ?? null,
            postAuditId
        );
        this.logger.log(
            "Inserted Comment with ID: ",
            commentResult.lastInsertRowid
        );
    }

    private insertAudit(
        db: DatabaseSync,
        time: number,
        by: string
    ): number | bigint {
        const auditsQuery = db.prepare(
            `INSERT INTO Audits (time, by) VALUES (?, ?)`
        );
        const result = auditsQuery.run(
            time ?? Temporal.Now.instant().epochMilliseconds,
            by ?? "unknown"
        );

        const postAuditId = result.lastInsertRowid;
        if (!postAuditId) {
            throw new Error("Failed to retrieve last inserted Audit ID");
        }
        return postAuditId;
    }

    private initSqlLiteSchema(options?: any): void {
        const db = new DatabaseSync(options?.databasePath || "output.db");
        this.logger.log(
            "Opened database at ",
            options?.databasePath || "output.db"
        );

        this.logger.log("Initializing SQLite schema...");
        db.exec(`CREATE TABLE IF NOT EXISTS Audits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time INTEGER NOT NULL,
            by TEXT NOT NULL)`);
        this.logger.log("Created Audits table.");

        db.exec(`CREATE TABLE IF NOT EXISTS Posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL, 
            score INTEGER NOT NULL,
            hn_id INTEGER NOT NULL,
            descendants INTEGER,
            audit_id INTEGER NOT NULL,
            FOREIGN KEY (audit_id) REFERENCES Audits(id)
        )`);
        this.logger.log("Created Posts table.");

        db.exec(`CREATE TABLE IF NOT EXISTS Comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hn_id INTEGER NOT NULL,
            score INTEGER,
            title TEXT,
            type TEXT NOT NULL,
            text TEXT,
            post_parent_id INTEGER,
            comment_parent_id INTEGER,

            audit_id INTEGER NOT NULL,
            FOREIGN KEY (audit_id) REFERENCES Audits(id)
        )`);
        this.logger.log("Created Comments table.");
    }
}
