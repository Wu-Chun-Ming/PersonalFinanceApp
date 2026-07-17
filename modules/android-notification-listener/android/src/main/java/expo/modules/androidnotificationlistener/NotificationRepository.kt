package expo.modules.androidnotificationlistener

import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase

class NotificationRepository(
    private val db: NotificationDatabase
) {
    fun insertNotification(
        notificationKey: String,
        packageName: String,
        title: String?,
        text: String?,
        postTime: Long
    ): Boolean {
        val values = ContentValues().apply {
            put("notification_key", notificationKey)
            put("package_name", packageName)
            put("title", title)
            put("text", text)
            put("post_time", postTime)
            put("status", "PENDING")
        }
        
        val database = db.writableDatabase

        val rowId = database.insertWithOnConflict(
            "notification_queue",
            null,
            values,
            SQLiteDatabase.CONFLICT_IGNORE
        )

        return rowId != -1L
    }

    fun getPending(): List<NotificationEntity> {
        val notifications = mutableListOf<NotificationEntity>()

        val cursor = db.readableDatabase.query(
            "notification_queue",
            arrayOf(
                "id",
                "notification_key",
                "package_name",
                "title",
                "text",
                "post_time",
                "status"
            ),
            "status = ?",
            arrayOf("PENDING"),
            null,
            null,
            "post_time ASC"
        )

        while (cursor.moveToNext()) {
            val id = cursor.getLong(cursor.getColumnIndexOrThrow("id"))
            val notificationKey = cursor.getString(cursor.getColumnIndexOrThrow("notification_key"))
            val packageName = cursor.getString(cursor.getColumnIndexOrThrow("package_name"))
            val title = cursor.getString(cursor.getColumnIndexOrThrow("title"))
            val text = cursor.getString(cursor.getColumnIndexOrThrow("text"))
            val postTime = cursor.getLong(cursor.getColumnIndexOrThrow("post_time"))
            val status = cursor.getString(cursor.getColumnIndexOrThrow("status"))

            notifications.add(
                NotificationEntity(
                    id,
                    notificationKey,
                    packageName,
                    title,
                    text,
                    postTime,
                    status
                )
            )
        }

        cursor.close()

        return notifications
    }

    fun markProcessed(id: Long): Boolean {
        val values = ContentValues().apply {
            put("status", "PROCESSED")
        }

        val rows = db.writableDatabase.update(
            "notification_queue",
            values,
            "id = ?",
            arrayOf(id.toString())
        )

        return rows > 0
    }
}