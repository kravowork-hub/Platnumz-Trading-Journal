package com.kravo.tradingjournal;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        window.setStatusBarColor(Color.rgb(9, 11, 16));
        window.setNavigationBarColor(Color.rgb(9, 11, 16));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
        }

        // Keep the edge-to-edge WebView and explicitly expose the actual
        // Android system-bar insets to the web UI.
        WindowCompat.setDecorFitsSystemWindows(window, false);

        View webView = getBridge().getWebView();

        ViewCompat.setOnApplyWindowInsetsListener(webView, (view, insets) -> {
            Insets systemBars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars()
                    | WindowInsetsCompat.Type.displayCutout()
            );


            view.evaluateJavascript(
                "document.documentElement.style.setProperty('--native-safe-area-top','"
                    + systemBars.top + "px');"
                    + "document.documentElement.style.setProperty('--native-safe-area-bottom','"
                    + systemBars.bottom + "px');"
                    + "document.documentElement.style.setProperty('--native-safe-area-left','"
                    + systemBars.left + "px');"
                    + "document.documentElement.style.setProperty('--native-safe-area-right','"
                    + systemBars.right + "px');",
                null
            );

            return insets;
        });

        ViewCompat.requestApplyInsets(webView);
    }
}
