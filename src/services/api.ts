// 后端真实端点常量（与 D:/ai_backend FastAPI 路由对齐）
// 旧的虚构端点（AI_CHAT 等）已删除，组件统一改走真实端点。
// 兼容旧字段：仍保留同名 key 但指向语义最接近的真实端点。
export const API_URLS = {
  // ─── 健康 ──────────────────────────────────────────────────
  HEALTH: '/health',

  // ─── 流式思考（实时对话主干）── modules/thinking/api_stream.py
  STREAM_SESSION: '/stream/session',          // POST 创建 / DELETE 关闭
  STREAM_WS: '/stream/ws',                    // ws://.../stream/ws/{session_id}
  STREAM_SSE: '/stream/sse',                  // GET/POST /stream/sse/{session_id}?question=
  STREAM_STATUS: '/stream/status',
  STREAM_CONTEXT: '/stream/context',          // GET /stream/context/{session_id}

  // ─── 兼容旧名（指向真实流式接口）────────────────────────────
  AI_CHAT: '/stream/session',
  AI_STREAM: '/stream/sse',
  AI_VOICE: '/output/speech',                 // 语音合成；真"通话"功能后端暂无

  // ─── 系统状态（旧 cognitiveApi 用名 → 真实接口）──────────────
  SYSTEM_STATUS: '/management/dashboard',
  EVENT_STREAM: '/management/monitor/logs',   // 旧名映射；真实事件流走 WS
  MEMORIES: '/memory/long-term',              // 列表入口（按 type 拆分见下）
  COGNITIVE_STATE: '/management/dashboard',   // 由 dashboard 派生
  SYSTEM_PARAMS: '/management/system',
  SYSTEM_LOGS: '/management/monitor/logs',

  // ─── 信息处理 ── infra/data_process/api.py
  SPEECH_RECOGNIZE: '/speech/recognize',
  SPEECH_RECOGNIZE_BASE64: '/speech/recognize-base64',
  IMAGE_ANALYZE: '/image/analyze',
  IMAGE_ANALYZE_URL: '/image/analyze-url',
  IMAGE_ANALYZE_BASE64: '/image/analyze-base64',
  IMAGE_DETECT_UI: '/image/detect-ui',
  IMAGE_ANALYZE_QUERY: '/image/analyze-query',
  IMAGE_DRAW_ELEMENTS: '/image/draw-elements',

  // ─── 工具管理 ── infra/tool_manager/api.py
  TOOLS_LIST: '/tools/',
  TOOLS_STATUS: '/tools/status',
  TOOLS_CALL: '/tools/call',
  TOOLS_CALL_SYNC: '/tools/call-sync',
  TOOLS_EVENTS: '/tools/events',
  TOOLS_REGISTER: '/tools/register',
  TOOLS_LOADED_PLUGINS: '/tools/plugins/loaded',
  TOOLS_RELOAD: '/tools/reload',              // POST /tools/reload/{plugin_name}
  TOOLS_INFO: '/tools/info',                  // GET /tools/info/{tool_name}

  // ─── 记忆 ── modules/memory/api.py
  MEMORY_SHORT_TERM_DIALOG: '/memory/short-term/dialog',
  MEMORY_SHORT_TERM_CONTEXT: '/memory/short-term/context',
  MEMORY_SHORT_TERM_WORKING: '/memory/short-term/working',
  MEMORY_SHORT_TERM_EMOTION: '/memory/short-term/emotion',
  MEMORY_SHORT_TERM_CLEAR: '/memory/short-term/clear',
  MEMORY_LONG_TERM: '/memory/long-term',
  MEMORY_PERSONALITY: '/memory/personality',
  MEMORY_BLACKBOX: '/memory/blackbox',
  MEMORY_TIMELINE: '/memory/blackbox/timeline',
  MEMORY_SEARCH: '/memory/search',
  MEMORY_STATUS: '/memory/status',
  MEMORY_SUMMARY: '/memory/summary',

  // ─── 注意力 ── modules/attention/api.py
  ATTENTION_WEIGHT_CALCULATE: '/attention/weight/calculate',
  ATTENTION_CONTEXT_BUILD: '/attention/context/build',
  ATTENTION_TASK_SCHEDULE: '/attention/task/schedule',
  ATTENTION_STATUS: '/attention/status',
  ATTENTION_ANALYZE: '/attention/analyze',
  ATTENTION_MEMORY_SCORE: '/attention/memory/score',
  ATTENTION_MEMORY_RECALL: '/attention/memory/recall',

  // ─── 管理控制台 ── modules/management/api.py
  MANAGEMENT_DASHBOARD: '/management/dashboard',
  MANAGEMENT_SYSTEM: '/management/system',
  MANAGEMENT_SYSTEM_PROCESS: '/management/system/process',
  MANAGEMENT_MODULES: '/management/modules',
  MANAGEMENT_MODULES_STATUS: '/management/modules/status',
  MANAGEMENT_MODULE_DETAIL: '/management/modules',   // GET /management/modules/{name}
  MANAGEMENT_MODULE_REFRESH: '/management/modules',  // POST /management/modules/{name}/refresh
  MANAGEMENT_MEMORY: '/management/memory',
  MANAGEMENT_MEMORY_CLEAR: '/management/memory/clear',
  MANAGEMENT_PERCEPTION: '/management/perception',
  MANAGEMENT_DATABASE: '/management/database',
  MANAGEMENT_RESOURCES: '/management/resources',
  MANAGEMENT_INFO_PROCESS: '/management/info-process',
  MANAGEMENT_THINKING: '/management/thinking',
  MANAGEMENT_ATTENTION: '/management/attention',
  MANAGEMENT_SECURITY: '/management/security',
  MANAGEMENT_HEALTH: '/management/health',
  MANAGEMENT_METRICS_LIVE: '/management/metrics/live',
  MANAGEMENT_METRICS_HISTORY: '/management/metrics/history',
  MANAGEMENT_METRICS_STATS: '/management/metrics/stats',
  MANAGEMENT_ALERTS: '/management/alerts',
  MANAGEMENT_ALERTS_SUMMARY: '/management/alerts/summary',
  MANAGEMENT_ALERTS_RULES: '/management/alerts/rules',
  MANAGEMENT_MONITOR_LOGS: '/management/monitor/logs',
  MANAGEMENT_MONITOR_MODULES: '/management/monitor/modules',

  // ─── 资源 ── modules/resource/api.py
  RESOURCES_SYSTEM_SNAPSHOT: '/resources/system/snapshot',
  RESOURCES_PROBES: '/resources/probes',
  RESOURCES_STATUS: '/resources/status',

  // ─── 输出 ── modules/output_system/api.py
  OUTPUT_TEXT: '/output/text',
  OUTPUT_SPEECH: '/output/speech',
  OUTPUT_STATUS: '/output/status',

  // ─── 插件商店 ── modules/plugin_system/store_api.py
  PLUGIN_STORE_CATEGORIES: '/plugin-store/categories',
  PLUGIN_STORE_PLUGINS: '/plugin-store/plugins',
  PLUGIN_STORE_DETAIL: '/plugin-store/plugin',    // GET /plugin-store/plugin/{plugin_id}
  PLUGIN_STORE_INSTALL: '/plugin-store/install',
  PLUGIN_STORE_OFFICIAL: '/plugin-store/official',

  // ─── 安全 ── modules/security_system/api.py
  SECURITY_STATUS: '/security/status',
  SECURITY_AUDIT: '/security/audit',

  // ─── 差异检测 ── modules/difference_detector/api.py
  DIFFERENCES_STATUS: '/differences/status',
  DIFFERENCES_ACTIVE: '/differences/active',
  DIFFERENCES_HISTORY: '/differences/history',
};

export default API_URLS;
