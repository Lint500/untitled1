"""
Qt WebView 应用打包脚本
使用前确保已运行: npm run build
"""
import os
import sys
import shutil
import subprocess
from pathlib import Path


def build():
    print("=" * 60)
    print("开始打包 Qt WebView 应用...")
    print("=" * 60)

    # 项目根目录
    root_dir = Path(__file__).parent.parent
    qt_app_dir = Path(__file__).parent
    dist_dir = root_dir / "build"
    qt_dist_dir = qt_app_dir / "build"

    # 1. 检查 React 构建文件是否存在
    if not (dist_dir / "index.html").exists():
        print("\n❌ 错误：找不到 build/ 目录")
        print("请先运行: npm run build")
        return False

    # 2. 清理旧的打包文件
    print("\n🧹 清理旧的打包文件...")
    old_dist = qt_app_dir / "dist"
    old_build = qt_app_dir / "build"
    if old_dist.exists():
        shutil.rmtree(old_dist)
    if old_build.exists():
        shutil.rmtree(old_build)

    # 3. 使用 PyInstaller 打包
    print("\n🔨 使用 PyInstaller 打包...")

    pyinstaller_cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--name=ReactDesktopApp",
        "--windowed",
        "-y",  # 强制覆盖输出目录
        "--hidden-import=PyQt6",
        "--hidden-import=PyQt6.QtWebEngineWidgets",
        "--clean",
        "main.py"
    ]

    try:
        result = subprocess.run(
            pyinstaller_cmd,
            cwd=qt_app_dir,
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ 打包完成！")

        # 4. 复制构建文件到打包目录
        print("\n📦 复制前端构建文件到打包目录...")
        final_build_path = qt_app_dir / "dist" / "ReactDesktopApp" / "build"
        if final_build_path.exists():
            shutil.rmtree(final_build_path)
        shutil.copytree(dist_dir, final_build_path)
        print(f"✅ 已复制到: {final_build_path}")

        # 5. 输出结果
        exe_path = qt_app_dir / "dist" / "ReactDesktopApp" / "ReactDesktopApp.exe"
        if exe_path.exists():
            print(f"\n✨ 成功！可执行文件位置：")
            print(f"   {exe_path}")
            print(f"\n📊 文件大小: {exe_path.stat().st_size / (1024 * 1024):.1f} MB")

            # 创建发布目录
            release_dir = root_dir / "releases"
            release_dir.mkdir(exist_ok=True)

            # 复制整个打包目录
            final_path = release_dir / "ReactDesktopApp-v1.0.0"
            if final_path.exists():
                shutil.rmtree(final_path)
            shutil.copytree(qt_app_dir / "dist" / "ReactDesktopApp", final_path)
            print(f"\n📁 发布版本已保存到：{final_path}")

        return True

    except subprocess.CalledProcessError as e:
        print(f"\n❌ 打包失败：")
        print(e.stderr)
        return False


if __name__ == "__main__":
    build()
