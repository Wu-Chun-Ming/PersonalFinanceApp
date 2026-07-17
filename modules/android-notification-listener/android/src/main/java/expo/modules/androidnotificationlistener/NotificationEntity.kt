package expo.modules.androidnotificationlistener

data class NotificationEntity(
    val id: Long,
    val notificationKey: String,
    val packageName: String,
    val title: String?,
    val text: String?,
    val postTime: Long,
    val status: String
)