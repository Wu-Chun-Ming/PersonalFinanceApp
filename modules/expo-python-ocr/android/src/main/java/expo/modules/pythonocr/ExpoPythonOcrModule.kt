package expo.modules.pythonocr

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException

import android.net.Uri
import java.io.InputStream
import java.net.URL

import com.chaquo.python.Python;
import com.chaquo.python.android.AndroidPlatform;

class ExpoPythonOcrModule : Module() {
  // Read bytes from a given URI
  private fun readBytesFromUri(uriString: String): ByteArray {
    val uri = Uri.parse(uriString)
    val context = appContext.reactContext ?: throw Exception("React context is null")
    val inputStream = context.contentResolver.openInputStream(uri) 
      ?: throw Exception("Unable to open URI")

    return inputStream.use { stream: InputStream ->
      stream.readBytes()
    }
  }

  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ExpoPythonOcr')` in JavaScript.
    Name("ExpoPythonOcr")

    // Initialize Python runtime
    OnCreate {
        if (!Python.isStarted()) {
            Python.start(AndroidPlatform(appContext.reactContext!!))
        }
    }

    // Defines constant property on the module.
    Constant("PI") {
      Math.PI
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }
    AsyncFunction("extractDateCategory") { imageUri: String, model: String, apiKey: String, prompt: String, promise: Promise ->
      try {
          // Read image bytes from URI
          val imageBytes = readBytesFromUri(imageUri)

          // Get Python instance and module
          val py = Python.getInstance()
          val module = py.getModule("main")
          // Call the Python function and get the result
          val result = module.callAttr("extract_date_category", imageBytes, model, apiKey, prompt)
          // Check if the result is a list
          val size = result.callAttr("__len__").toInt()
          
          val responseList = mutableListOf<Map<String, String?>>()
          // Iterate over the list and extract date and category
          for (i in 0 until size) {
            val item = result.callAttr("__getitem__", i)
            val date = item.callAttr("get", "date")?.toString()
            val category = item.callAttr("get", "category")?.toString()
            responseList.add(mapOf("date" to date, "category" to category))
          }
          
          // Resolve the promise with the response
          promise.resolve(responseList)
      } catch (e: Exception) {
          promise.reject(CodedException("PYTHON_ERROR", e.message, e))
      }
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ExpoPythonOcrView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: ExpoPythonOcrView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }
}
