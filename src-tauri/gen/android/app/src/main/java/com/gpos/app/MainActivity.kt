package com.gpos.app

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.print.PrintAttributes
import android.print.PrintManager
import android.util.Base64
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File
import java.net.URLDecoder

class AndroidBridge(private val activity: MainActivity, private val mainWebView: WebView) {
    @JavascriptInterface
    fun printReceipt(html: String) {
        activity.runOnUiThread {
            try {
                val printWebView = WebView(activity)
                printWebView.settings.javaScriptEnabled = false
                printWebView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null)
                printWebView.webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView?, url: String?) {
                        val printManager = activity.getSystemService(Context.PRINT_SERVICE) as? PrintManager
                        val printAdapter = printWebView.createPrintDocumentAdapter("gPOS-Struk")
                        val jobName = "gPOS-Struk-" + System.currentTimeMillis()
                        val printAttributes = PrintAttributes.Builder()
                            .setColorMode(PrintAttributes.COLOR_MODE_MONOCHROME)
                            .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                            .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                            .build()
                        printManager?.print(jobName, printAdapter, printAttributes)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}

class MainActivity : TauriActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Configure Status Bar & Navigation Bar appearance
        window.statusBarColor = Color.parseColor("#f7f4ee")
        window.navigationBarColor = Color.parseColor("#2f6b4f")

        val insetsController = WindowCompat.getInsetsController(window, window.decorView)
        insetsController.isAppearanceLightStatusBars = true
        insetsController.isAppearanceLightNavigationBars = false
    }

    override fun onWebViewCreate(webView: WebView) {
        super.onWebViewCreate(webView)

        webView.setBackgroundColor(Color.parseColor("#f7f4ee"))

        // Add padding at the top of the WebView equal to the Status Bar & Cutout/Notch height
        ViewCompat.setOnApplyWindowInsetsListener(webView) { v, insets ->
            val statusBarInsets = insets.getInsets(
                WindowInsetsCompat.Type.statusBars() or WindowInsetsCompat.Type.displayCutout()
            )
            v.setPadding(0, statusBarInsets.top, 0, 0)
            insets
        }

        webView.addJavascriptInterface(AndroidBridge(this, webView), "AndroidBridge")

        webView.setDownloadListener { url, _, _, _, _ ->
            try {
                if (url.startsWith("data:")) {
                    val bytes = if (url.contains("base64,")) {
                        Base64.decode(url.substringAfter("base64,"), Base64.DEFAULT)
                    } else {
                        URLDecoder.decode(url.substringAfter("charset=utf-8,").substringAfter("data:text/csv,"), "UTF-8").toByteArray(Charsets.UTF_8)
                    }

                    val downloadDir = getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
                    val file = File(downloadDir, "laporan-transaksi-" + System.currentTimeMillis() + ".csv")
                    file.writeBytes(bytes)

                    val uri: Uri = FileProvider.getUriForFile(this, "${packageName}.fileprovider", file)
                    val sendIntent = Intent(Intent.ACTION_SEND).apply {
                        type = "text/csv"
                        putExtra(Intent.EXTRA_STREAM, uri)
                        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    }
                    startActivity(Intent.createChooser(sendIntent, "Bagikan Laporan CSV"))
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
