package expo.modules.androidnotificationlistener

import android.content.Context
import android.content.Intent
import android.provider.Settings

object NotificationPermission {
    fun open(context: Context) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        context.startActivity(intent)
    }
}