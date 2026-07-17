package expo.modules.androidnotificationlistener

object NotificationEventBus {
    private var listener: ((Map<String, Any>) -> Unit)? = null

    fun register(callback: (Map<String, Any>) -> Unit) {
        listener = callback
    }

    fun unregister() {
        listener = null
    }

    fun emit(data: Map<String, Any>) {
        listener?.invoke(data)
    }
}