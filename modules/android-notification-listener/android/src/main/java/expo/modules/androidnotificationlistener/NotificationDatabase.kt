package expo.modules.androidnotificationlistener

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class NotificationDatabase(
    context: Context
) : SQLiteOpenHelper(
    context,
    "localDatabase.db",
    null,
    1
) {
    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """
            CREATE TABLE IF NOT EXISTS notification_queue(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notification_key TEXT UNIQUE,
                package_name TEXT,
                title TEXT,
                text TEXT,
                post_time INTEGER,
                status TEXT
            )
            """.trimIndent()
        )
    }

    override fun onUpgrade(
        db: SQLiteDatabase,
        oldVersion: Int,
        newVersion: Int
    ) {}
}