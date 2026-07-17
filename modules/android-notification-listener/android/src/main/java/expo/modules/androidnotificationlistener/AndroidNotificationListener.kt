package expo.modules.androidnotificationlistener

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class AndroidNotificationListener : NotificationListenerService() {
    private lateinit var repository: NotificationRepository

    override fun onCreate() {
        super.onCreate()

        repository = NotificationRepository(
            NotificationDatabase(this)
        )
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
    }

    override fun onNotificationPosted(
        sbn: StatusBarNotification
    ) {
        val extras = sbn.notification.extras
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
        val inserted = repository.insertNotification(
            notificationKey = sbn.key,
            packageName = sbn.packageName,
            title = title,
            text = text,
            postTime = sbn.postTime
        )

        if (inserted) {
            // Emit the notification data to the event bus
            NotificationEventBus.emit(
                mapOf(
                    "type" to "NEW_NOTIFICATION"
                )
            )
        }
    }

    override fun onNotificationRemoved(
        sbn: StatusBarNotification
    ) {
    }
}