import sys
from pathlib import Path
from PyQt6.QtWidgets import QApplication, QMainWindow, QLineEdit, QToolBar, QProgressBar, QMessageBox
from PyQt6.QtGui import QAction
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtCore import QUrl


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("React Desktop App")
        self.resize(1280, 800)
        self.setMinimumSize(800, 600)

        if getattr(sys, 'frozen', False):
            self.app_dir = Path(sys.executable).parent
        else:
            self.app_dir = Path(__file__).parent

        self.setupUI()
        self.loadApp()

    def setupUI(self):
        # WebView
        self.webview = QWebEngineView()
        self.setCentralWidget(self.webview)

        # 工具栏
        toolbar = QToolBar()
        toolbar.setMovable(False)
        toolbar.setFixedHeight(40)
        self.addToolBar(toolbar)

        back_action = toolbar.addAction("←")
        back_action.setToolTip("后退")
        back_action.triggered.connect(self.webview.back)

        forward_action = toolbar.addAction("→")
        forward_action.setToolTip("前进")
        forward_action.triggered.connect(self.webview.forward)

        refresh_action = toolbar.addAction("🔄")
        refresh_action.setToolTip("刷新")
        refresh_action.triggered.connect(self.webview.reload)

        toolbar.addSeparator()

        self.address_bar = QLineEdit()
        self.address_bar.setPlaceholderText("加载应用...")
        self.address_bar.setReadOnly(True)
        self.address_bar.setMinimumWidth(400)
        toolbar.addWidget(self.address_bar)

        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setMaximumWidth(150)
        self.statusBar().addPermanentWidget(self.progress_bar)

        # 信号连接
        self.webview.loadProgress.connect(self.progress_bar.setValue)
        self.webview.loadFinished.connect(self.onLoadFinished)
        self.webview.urlChanged.connect(lambda url: self.address_bar.setText(url.toString()))

    def loadApp(self):
        if getattr(sys, 'frozen', False):
            build_path = self.app_dir / "build" / "index.html"
        else:
            build_path = self.app_dir.parent / "build" / "index.html"

        if build_path.exists():
            url = QUrl.fromLocalFile(str(build_path))
            self.statusBar().showMessage("加载本地应用...")
        else:
            url = QUrl("http://localhost:5173")
            self.statusBar().showMessage("连接开发服务器...")

        self.webview.load(url)

    def onLoadFinished(self, success):
        self.progress_bar.hide()
        if success:
            self.statusBar().showMessage("应用加载完成", 3000)
        else:
            self.statusBar().showMessage("加载失败", 3000)
            QMessageBox.warning(self, "错误",
                                "无法加载应用。\n\n如果是开发模式，请先运行：npm run dev")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setApplicationName("React Desktop App")
    app.setApplicationVersion("1.0.0")
    app.setOrganizationName("YourCompany")

    window = MainWindow()
    window.show()

    sys.exit(app.exec())