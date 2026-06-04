"""
Management API 前端调用示例
"""
import requests

BASE_URL = "http://localhost:8000"


# ========== GET 接口（查询监控数据）==========

def get_monitor_status():
    """获取全局监控状态（9大领域完整数据）"""
    response = requests.get(f"{BASE_URL}/management/monitor/status")
    return response.json()


def get_monitor_summary():
    """获取监控摘要（快速检查）"""
    response = requests.get(f"{BASE_URL}/management/monitor/summary")
    return response.json()


def get_alerts(level="all"):
    """
    获取告警列表
    
    Args:
        level: all | critical | warning
    """
    response = requests.get(
        f"{BASE_URL}/management/monitor/alerts",
        params={"level": level}
    )
    return response.json()


def get_module_status():
    """获取模块运行状态"""
    response = requests.get(f"{BASE_URL}/management/monitor/modules")
    return response.json()


def get_resource_status():
    """获取资源使用状态"""
    response = requests.get(f"{BASE_URL}/management/monitor/resources")
    return response.json()


def get_emotion_status():
    """获取情绪模块状态"""
    response = requests.get(f"{BASE_URL}/management/monitor/emotion")
    return response.json()


def get_thinking_history(thinking_id=None, limit=50):
    """
    获取思考过程记录
    
    Args:
        thinking_id: 思考ID（可选）
        limit: 返回记录数量
    """
    params = {"limit": limit}
    if thinking_id:
        params["thinking_id"] = thinking_id
    
    response = requests.get(
        f"{BASE_URL}/management/monitor/thinking",
        params=params
    )
    return response.json()


def get_management_status():
    """获取管理系统状态"""
    response = requests.get(f"{BASE_URL}/management/status")
    return response.json()


# ========== POST 接口（记录数据）==========

def record_module_status(module_name: str, status: str, details: dict = None):
    """
    记录模块状态
    
    Args:
        module_name: 模块名称
        status: running | idle | error | crashed
        details: 详细信息字典
    """
    response = requests.post(
        f"{BASE_URL}/management/monitor/record/module",
        json={
            "module_name": module_name,
            "status": status,
            "details": details or {}
        }
    )
    return response.json()


def record_emotion_state(emotion: str, intensity: float, context: str = ""):
    """
    记录情绪状态
    
    Args:
        emotion: 情绪类型
        intensity: 情绪强度 (0.0-1.0)
        context: 上下文描述
    """
    response = requests.post(
        f"{BASE_URL}/management/monitor/record/emotion",
        json={
            "emotion": emotion,
            "intensity": intensity,
            "context": context
        }
    )
    return response.json()


def record_thinking_process(thinking_id: str, phase: str, details: dict):
    """
    记录思考过程
    
    Args:
        thinking_id: 思考ID
        phase: start | manager_decide | expert_execute | end
        details: 详细信息字典
    """
    response = requests.post(
        f"{BASE_URL}/management/monitor/record/thinking",
        json={
            "thinking_id": thinking_id,
            "phase": phase,
            "details": details
        }
    )
    return response.json()


def record_evolution_action(action: str, target: str, changes: dict, safety_check: bool):
    """
    记录自进化行为
    
    Args:
        action: 行为类型
        target: 目标文件/配置
        changes: 变更内容
        safety_check: 是否通过安全检查
    """
    response = requests.post(
        f"{BASE_URL}/management/monitor/record/evolution",
        json={
            "action": action,
            "target": target,
            "changes": changes,
            "safety_check": safety_check
        }
    )
    return response.json()


def schedule_module(module_name: str):
    """
    调度模块
    
    Args:
        module_name: 模块名称
    """
    response = requests.post(
        f"{BASE_URL}/management/module/schedule",
        json={"module_name": module_name}
    )
    return response.json()


def optimize_system(params: dict):
    """
    执行自适应优化
    
    Args:
        params: 优化参数字典
    """
    response = requests.post(
        f"{BASE_URL}/management/optimize",
        json=params
    )
    return response.json()


# ========== 使用示例 ==========

if __name__ == "__main__":
    # 1. 查询监控数据
    print("=== 全局监控状态 ===")
    status = get_monitor_status()
    print(status)
    
    print("\n=== 监控摘要 ===")
    summary = get_monitor_summary()
    print(summary)
    
    print("\n=== 模块状态 ===")
    modules = get_module_status()
    print(modules)
    
    print("\n=== 资源状态 ===")
    resources = get_resource_status()
    print(resources)
    
    print("\n=== 情绪状态 ===")
    emotion = get_emotion_status()
    print(emotion)
    
    print("\n=== 思考历史（最近10条）===")
    thinking = get_thinking_history(limit=10)
    print(thinking)
    
    print("\n=== 告警列表 ===")
    alerts = get_alerts(level="all")
    print(alerts)
    
    # 2. 记录数据
    print("\n=== 记录模块状态 ===")
    result = record_module_status(
        module_name="thinking",
        status="running",
        details={"active_experts": 4}
    )
    print(result)
    
    print("\n=== 记录情绪状态 ===")
    result = record_emotion_state(
        emotion="focused",
        intensity=0.8,
        context="深度思考中"
    )
    print(result)
    
    print("\n=== 记录思考过程 ===")
    result = record_thinking_process(
        thinking_id="think_001",
        phase="start",
        details={"question": "测试问题"}
    )
    print(result)
    
    print("\n=== 记录自进化行为 ===")
    result = record_evolution_action(
        action="update_config",
        target="config/settings.py",
        changes={"LOG_LEVEL": "DEBUG"},
        safety_check=True
    )
    print(result)
    
    print("\n=== 调度模块 ===")
    result = schedule_module("memory")
    print(result)
    
    print("\n=== 管理系统状态 ===")
    mgmt_status = get_management_status()
    print(mgmt_status)
