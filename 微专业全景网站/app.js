/* 人工智能（AI）技术应用微专业 · 课程管理站
   数据由 rebuild_management.py 生成：只呈现当前有效、必要的课程管理资料。
   课程目标 / 核心内容 / 教学方式 / 考核方式均为培养方案 (6) 原文；
   齐备度、缺失范围、待补充内容与影响说明为「管理口径判断」，已在页面明确标注。 */
(function () {
'use strict';

var D = window.SITE_DATA || {};
var DOCS = D.docs || [];
var COURSES = D.courses || [];
var REQ = D.requiredTypes || [];
var COMP = D.completeness || {};
var STANDARD = D.standard || {};
var STATS = D.stats || {};
var META = D.meta || {};
var EXCLUDED = D.excluded || {};

var $ = function (s) { return document.querySelector(s); };
var esc = function (s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};
var qs = function (o) {
  return Object.keys(o).filter(function (k) { return o[k] !== '' && o[k] != null; })
    .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(o[k]); }).join('&');
};
var fmtSize = function (b) {
  b = b || 0;
  return b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
};
var EXT_COLOR = { docx: '#2b579a', doc: '#2b579a', pptx: '#d24726',
  xlsx: '#1e7145', pdf: '#c0392b', html: '#6b46c1', md: '#4a5568' };
var extTag = function (e) {
  var c = EXT_COLOR[e] || '#6d7690';
  return '<span class="ft" style="background:' + c + '">' +
    esc(String(e || '?').toUpperCase().slice(0, 4)) + '</span>';
};
var courseById = function (id) {
  for (var i = 0; i < COURSES.length; i++) if (COURSES[i].id === id) return COURSES[i];
  return { id: id, name: '专业级基线文件', sem: 0, no: 0 };
};
var courseName = function (id) {
  return id === 'P' ? '专业级基线' : courseById(id).name;
};
var semLabel = function (s) { return s === 1 ? '第 1 学期' : s === 2 ? '第 2 学期' : '专业级'; };
var badge = function (t, cls) { return '<span class="badge ' + (cls || '') + '">' + esc(t) + '</span>'; };

var STATUS = {
  ok: { label: '齐备', cls: 'ok', icon: '✓' },
  partial: { label: '不完整 / 待核', cls: 'warn', icon: '△' },
  missing: { label: '缺失', cls: 'red', icon: '✕' }
};
function statusBadge(s) {
  var m = STATUS[s] || STATUS.missing;
  return '<span class="st st-' + m.cls + '">' + m.icon + ' ' + m.label + '</span>';
}
function hl(text, q) {
  var s = esc(text == null ? '' : text);
  if (!q) return s;
  try {
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
    return s.replace(re, '<mark>$1</mark>');
  } catch (e) { return s; }
}

/* ---------------- 路由 ---------------- */
function parseRoute() {
  var h = location.hash.replace(/^#\/?/, '') || 'dashboard';
  var qi = h.indexOf('?');
  var path = qi >= 0 ? h.slice(0, qi) : h;
  var params = {};
  if (qi >= 0) {
    h.slice(qi + 1).split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      try { params[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || '').replace(/\+/g, ' ')); }
      catch (e) { params[p[0]] = p[1] || ''; }
    });
  }
  var seg = path.split('/');
  return { view: seg[0] || 'dashboard', id: seg[1] || '', params: params };
}
function go(hash) { location.hash = hash; }

/* ---------------- 侧栏 ---------------- */
function navItem(label, href, icon, count, on) {
  return '<a class="nav-item' + (on ? ' on' : '') + '" href="' + href + '">' +
    (icon ? '<span class="ic">' + icon + '</span>' : '') + '<span>' + esc(label) + '</span>' +
    (count != null ? '<span class="cnt">' + count + '</span>' : '') + '</a>';
}
function renderNav(r) {
  var h = '';
  h += '<div class="nav-group"><h5>课程管理</h5>';
  h += navItem('管理总览', '#/dashboard', '◈', null, r.view === 'dashboard');
  h += navItem('课程设置与基线', '#/program', '▤', null, r.view === 'program');
  h += navItem('资料完整性核查', '#/completeness', '⚑', STATS.actions, r.view === 'completeness');
  h += navItem('课程资料库', '#/library', '▣', DOCS.length, r.view === 'library');
  h += navItem('内容取舍与治理', '#/governance', 'ⓘ', EXCLUDED.total, r.view === 'governance');
  h += '</div><div class="nav-sep"></div>';

  [1, 2].forEach(function (s) {
    var cs = COURSES.filter(function (c) { return c.sem === s; });
    h += '<div class="nav-group"><h5>' + semLabel(s) + ' · 课程档案</h5><div class="nav-sub">';
    cs.forEach(function (c) {
      var v = COMP[c.id] || {};
      h += navItem(c.name, '#/course/' + c.id, '', (v.score != null ? v.score + '%' : ''),
        r.view === 'course' && r.id === c.id);
    });
    h += '</div></div>';
  });

  h += '<div class="nav-sep"></div><div class="nav-group"><h5>按资料类型</h5>';
  Object.keys(STATS.byCategory || {}).sort().forEach(function (c) {
    h += navItem(c, '#/library?' + qs({ cat: c }), '', STATS.byCategory[c],
      r.view === 'library' && r.params.cat === c);
  });
  h += '</div>';
  $('#navTree').innerHTML = h;
  $('#topStat').innerHTML =
    '<span><b>' + COURSES.length + '</b>门课程</span>' +
    '<span><b>' + STATS.included + '</b>份在库资料</span>' +
    '<span><b>' + STATS.avgReady + '%</b>平均齐备度</span>';
}

function renderToc(r) {
  var heads = Array.prototype.slice.call(document.querySelectorAll('#main h2.sec, #main h3.sub'));
  var links = '';
  heads.forEach(function (el, i) {
    if (!el.id) el.id = 'sec' + i;
    links += '<a href="#' + el.id + '" data-sec="' + el.id + '">' + esc(el.textContent) + '</a>';
  });
  $('#tocLinks').innerHTML = links || '<a href="#/dashboard">返回总览</a>';
  var extra = '';
  if (r.view === 'course' && COMP[r.id]) {
    var v = COMP[r.id];
    extra = '<div class="box"><b>' + esc(courseName(r.id)) + '</b><p>资料齐备度 ' + v.score +
      '%（' + esc(v.level) + '）。本页逐项列出缺失范围、待补充内容与可能影响。</p></div>';
  } else {
    extra = '<div class="box"><b>口径区分</b><p>课程目标、核心内容等为培养方案 (6) 原文；' +
      '齐备度、缺失说明与影响判断为课程管理口径，均已在页面标注，未改写任何原始文件。</p></div>';
  }
  $('#tocBox').innerHTML = extra;
  Array.prototype.forEach.call(document.querySelectorAll('#tocLinks a'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById(a.getAttribute('data-sec'));
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------------- 通用片段 ---------------- */
function sec(t) { return '<h2 class="sec">' + esc(t) + '</h2>'; }
function sub(t) { return '<h3 class="sub">' + esc(t) + '</h3>'; }
function note(kind, html) { return '<div class="note ' + kind + '">' + html + '</div>'; }

var docMap = {};
DOCS.forEach(function (d) { docMap[d.id] = d; });

function docActions(d) {
  var h = '<div class="btnrow">';
  h += '<button class="btn solid" data-preview="' + esc(d.id) + '">在线预览</button>';
  h += '<a class="btn" href="' + esc(d.word) + '" download>Word 版本</a>';
  if (d.original) h += '<a class="btn gray" href="' + esc(d.original) + '" download>原始文件</a>';
  return h + '</div>';
}
function flagsHtml(d) {
  if (!d.flags || !d.flags.length) return '';
  return '<div class="flags">' + d.flags.map(function (f) {
    return badge(f, f.indexOf('⚠') === 0 ? 'warn' : 'gray');
  }).join('') + '</div>';
}
function docCard(d, q) {
  return '<div class="doc">' +
    '<div class="h">' + extTag(d.ext) + '<h4>' + hl(d.title, q) + '</h4>' +
    badge(courseName(d.course)) + badge(d.category, 'teal') +
    (d.effective === '待核' ? badge('待核', 'warn') : '') + '</div>' +
    '<div class="meta2">文件：' + hl(d.filename, q) + '　·　来源：' + hl(d.source, q) +
    '　·　' + esc(d.role) + '　·　' + esc(d.versionLabel) +
    '　·　' + esc(String(d.ext).toUpperCase()) + ' / ' + fmtSize(d.size) +
    '　·　' + esc(d.id) + '</div>' +
    (d.notes && d.notes.length ? '<div class="flags">' + d.notes.map(function (n) {
      return badge('ℹ ' + n, 'gray');
    }).join('') + '</div>' : '') +
    flagsHtml(d) + '<div class="acts">' + docActions(d) + '</div></div>';
}

function readinessBar(pct, level) {
  var cls = pct >= 80 ? 'good' : (pct >= 40 ? 'mid' : 'low');
  return '<div class="ready"><div class="ready-top"><b>资料齐备度</b>' +
    '<span>' + pct + '% · ' + esc(level) + '</span></div>' +
    '<div class="ready-bar"><i class="' + cls + '" style="width:' + pct + '%"></i></div></div>';
}

function matrixCell(cid, item) {
  var m = STATUS[item.status];
  return '<td><a class="mx mx-' + m.cls + '" href="#/course/' + cid + '" title="' +
    esc(item.name + '：' + m.label) + '">' + m.icon + '</a></td>';
}
function matrixTable() {
  var h = '<div class="table-scroll"><table class="t matrix"><thead><tr><th>课程</th>';
  REQ.forEach(function (t) { h += '<th>' + esc(t.name) + '</th>'; });
  h += '<th>齐备度</th></tr></thead><tbody>';
  COURSES.forEach(function (c) {
    var v = COMP[c.id] || { items: [], score: 0 };
    h += '<tr><td class="wrap"><a href="#/course/' + c.id + '">' +
      esc(c.id + ' ' + c.name) + '</a></td>';
    v.items.forEach(function (it) { h += matrixCell(c.id, it); });
    h += '<td><b>' + v.score + '%</b></td></tr>';
  });
  h += '</tbody></table></div>';
  h += '<p class="tiny muted" style="margin-top:8px">✓ 齐备　△ 不完整 / 待核（有文件但口径或覆盖需补正）　' +
    '✕ 缺失（无归档文件）。点击单元格进入课程档案查看逐项说明。</p>';
  return h;
}

function foundLinks(ids) {
  if (!ids || !ids.length) return '<span class="muted tiny">无归档文件</span>';
  return ids.slice(0, 5).map(function (id) {
    var d = docMap[id];
    if (!d) return '';
    return '<button class="lnk" data-preview="' + esc(id) + '">' + esc(d.filename) + '</button>';
  }).join('') + (ids.length > 5 ?
    '<span class="tiny muted"> 另有 ' + (ids.length - 5) + ' 份，见课程资料库</span>' : '');
}

function checkItem(it) {
  var m = STATUS[it.status];
  var h = '<div class="check check-' + m.cls + '">';
  h += '<div class="check-h"><b>' + esc(it.name) + '</b>' + statusBadge(it.status) +
    (it.status !== 'ok' ? badge(it.severity === 'high' ? '高优先' : '常规',
      it.severity === 'high' ? 'red' : 'gray') : '') +
    '<span class="check-desc">' + esc(it.desc) + '</span></div>';
  h += '<div class="check-found"><span class="lbl">已归档</span>' + foundLinks(it.found) + '</div>';
  if (it.status !== 'ok') {
    h += '<div class="check-grid">' +
      '<div><span class="lbl">缺失范围</span><p>' + esc(it.missingRange) + '</p></div>' +
      '<div><span class="lbl">待补充内容</span><p>' + esc(it.toAdd) + '</p></div>' +
      '<div><span class="lbl">可能影响</span><p>' + esc(it.impact) + '</p></div></div>';
  }
  return h + '</div>';
}

/* ---------------- 视图：管理总览 ---------------- */
/* ---------------- 建设参考：微专业PPT总结（按主题融入现有视图） ---------------- */
var BP = D.bestPractices || {};
var BP_THEMES = BP.themes || [];
var WKP = D.weekParity || {};

/* 48 学时课程单周 / 双周列示口径（与定稿 Word 同源，见 week_parity.py） */
function parityBlock() {
  if (!WKP.title) return '';
  var o = WKP.odd || {}, e = WKP.even || {}, t = WKP.total || {};
  var rows = [o, e].map(function (x) {
    return '<tr><td><b>' + esc(x.label) + '</b></td><td>' + esc(x.weeks) + '</td><td>' +
      (x.count || 0) + ' 周</td><td>' + (x.hoursPerWeek || 0) + ' 学时 / 周</td><td><b>' +
      (x.subtotal || 0) + ' 学时</b></td></tr>';
  }).join('');
  rows += '<tr><td><b>合计</b></td><td>第 1—16 周</td><td>' + (t.weeks || 16) +
    ' 周</td><td>' + (t.hoursPerWeek || 3) + ' 学时 / 周</td><td><b>' + (t.hours || 48) +
    ' 学时</b></td></tr>';
  return '<div class="table-scroll"><table class="t"><thead><tr><th>分组</th>' +
    '<th>对应周次</th><th>周数</th><th>周学时</th><th>小计</th></tr></thead><tbody>' +
    rows + '</tbody></table></div>' +
    '<p class="tiny" style="margin:10px 0 0">适用范围：' + esc(WKP.docs) + '。</p>' +
    note('info', '<b>口径说明：</b>' + esc(WKP.note));
}

function bpTheme(id) {
  for (var i = 0; i < BP_THEMES.length; i++) {
    if (BP_THEMES[i].id === id) return BP_THEMES[i];
  }
  return null;
}

function practiceCard(t, compact) {
  if (!t) return '';
  var h = '<div class="card"><b>' + esc(t.title) + '</b>' +
    '<div class="tiny muted" style="margin:4px 0 8px">融入位置：' + esc(t.placement) + '</div>' +
    '<ul class="clean">' + (t.points || []).map(function (p) {
      return '<li>' + esc(p) + '</li>';
    }).join('') + '</ul>';
  if (compact) {
    h += '<div class="tiny" style="margin-top:8px;color:var(--ink2)"><b>与本校口径：</b>' +
      esc(t.local) + '</div>';
  } else {
    h += note('ok', '<b>与本校口径的关系：</b>' + esc(t.local));
    h += '<div class="tiny muted" style="margin-top:8px">参考来源：' +
      (t.sources || []).map(esc).join('　｜　') + '</div>';
  }
  return h + '</div>';
}

function practiceThemes(ids, compact) {
  return '<div class="grid2">' + ids.map(function (id) {
    return practiceCard(bpTheme(id), compact);
  }).join('') + '</div>';
}

function bpSources() {
  return '<div class="grid3">' + (BP.sources || []).map(function (s) {
    return '<div class="card"><b>' + esc(s.name) + '</b>' +
      '<div class="mono tiny" style="margin:6px 0;color:var(--brand)">' + esc(s.file) + '</div>' +
      '<div class="tiny">' + esc(s.use) + '</div></div>';
  }).join('') + '</div>';
}

function viewDashboard() {
  var h = '<div class="hero"><div class="eyebrow">' + esc(META.school) + ' · ' + esc(META.term) + '</div>' +
    '<h1>人工智能（AI）技术应用微专业<br>课程管理总览</h1>' +
    '<p>以《人工智能技术应用微专业培养方案 (6).docx》为唯一权威基线，聚焦课程信息、课程执行资料与管理状态；' +
    '只呈现当前有效、必要的资料，并逐门标注资料缺失范围、待补充内容与可能影响。</p>' +
    '<div class="chips"><span>6 门课程</span><span>2 个学期</span><span>' + STATS.credit +
    ' 学分</span><span>' + STATS.hours + ' 学时</span><span>' + STATS.included +
    ' 份在库资料</span></div></div>';

  h += '<div class="kpi">' +
    '<div class="stat"><b>' + STATS.avgReady + '%</b><span>平均资料齐备度</span></div>' +
    '<div class="stat"><b>' + STATS.actions + '</b><span>待补 / 待核事项</span></div>' +
    '<div class="stat"><b>' + STATS.highActions + '</b><span>高优先待办</span></div>' +
    '<div class="stat"><b>' + ((STATS.byEffective || {})['当前有效'] || 0) + '/' +
    STATS.included + '</b><span>当前有效资料</span></div>' +
    '<div class="stat"><b>' + STATS.excluded + '</b><span>已按标准排除</span></div></div>';

  h += note('info', '<b>内容取舍：</b>培养方案仅展示 (6) 版；历史版本、重复副本、上一学年关联课程资料、' +
    '学生作业与成绩记录、会议调研资料均不进入课程资料库。' +
    '<a href="#/governance">查看完整取舍标准与排除清单 →</a>　' +
    '<a href="#/governance">建设参考与最佳实践（6 个主题）→</a>');

  h += sec('课程管理健康度');
  h += '<p class="lead">按「课程 × 必备资料类型」核查，反映每门课程的建档状态，而非资料数量。</p>';
  h += matrixTable();

  h += sec('待办优先级清单');
  h += '<p class="lead">共 ' + STATS.actions + ' 项（高优先 ' + STATS.highActions +
    ' 项）。以下为管理口径判断，全部基于实际归档文件比对得出。</p>';
  h += '<div class="table-scroll"><table class="t"><thead><tr><th>课程</th><th>资料类型</th>' +
    '<th>状态</th><th>缺失范围</th><th>待补充内容</th><th>可能影响</th></tr></thead><tbody>';
  COURSES.forEach(function (c) {
    var v = COMP[c.id] || { items: [] };
    v.items.forEach(function (it) {
      if (it.status === 'ok') return;
      h += '<tr><td><a href="#/course/' + c.id + '">' + esc(c.id) + '</a></td>' +
        '<td>' + esc(it.name) + '</td><td>' + statusBadge(it.status) + '</td>' +
        '<td class="wrap tiny">' + esc(it.missingRange) + '</td>' +
        '<td class="wrap tiny">' + esc(it.toAdd) + '</td>' +
        '<td class="wrap tiny">' + esc(it.impact) + '</td></tr>';
    });
  });
  h += '</tbody></table></div>';

  h += sec('当前有效基线');
  var plan = DOCS.filter(function (d) { return d.category === '培养方案'; });
  var task = DOCS.filter(function (d) { return d.category === '课程安排'; });
  h += '<div class="grid2">';
  plan.forEach(function (d) {
    h += '<div class="card"><span class="badge teal">唯一有效版本</span>' +
      '<div class="card-title">' + esc(d.title) + '</div>' +
      '<p class="tiny muted" style="margin:0">课程设置、学分学时、开课学期、课程目标与核心内容均以此文件原文为准。</p>' +
      '<div style="margin-top:11px">' + docActions(d) + '</div></div>';
  });
  task.forEach(function (d) {
    h += '<div class="card"><span class="badge">排课基线</span>' +
      '<div class="card-title">' + esc(d.title) + '</div>' +
      '<p class="tiny muted" style="margin:0">覆盖 4 门已排课课程的任课教师、学时、教室与上课时间；C5 / C6 暂无排课记录。</p>' +
      '<div style="margin-top:11px">' + docActions(d) + '</div></div>';
  });
  h += '</div>';
  h += note('warn', '原有 ' + STATS.programVersions + ' 份培养方案相关文件中，8 份历史稿 / 方向稿 / 模板已从展示范围移除；' +
    '4 门旧版教学大纲由 2026-11 定稿版取代。<a href="#/governance">版本处置明细 →</a>');

  h += sec('取舍标准速览');
  h += '<div class="grid2"><div class="card"><b>纳入范围</b><ul class="clean">' +
    (STANDARD.include || []).map(function (x) {
      return '<li><b>' + esc(x.label) + '</b>：' + esc(x.desc) + '</li>';
    }).join('') + '</ul></div>' +
    '<div class="card"><b>已排除（' + EXCLUDED.total + ' 份）</b><ul class="clean">' +
    (EXCLUDED.groups || []).map(function (g) {
      return '<li>' + badge(g.name + ' · ' + g.count, 'warn') + ' ' + esc(g.why) + '</li>';
    }).join('') + '</ul><a class="btn" style="margin-top:9px" href="#/governance">查看排除清单</a></div></div>';
  return h;
}

/* ---------------- 视图：课程设置与基线 ---------------- */
function viewProgram() {
  var h = '<div class="hero" style="padding:24px 30px"><div class="eyebrow">权威基线 · 唯一有效版本</div>' +
    '<h1 style="font-size:23px">课程设置与培养方案基线</h1>' +
    '<p>全站 6 门课程的名称、学分学时、开课学期与课程介绍均以《人工智能技术应用微专业培养方案 (6).docx》为准，' +
    '历史版本不参与任何页面展示。</p></div>';

  h += note('ok', '<b>基线文件：</b>' + esc(META.authority) +
    '。其余 8 份培养方案（(3)(4)(5)、-1、无后缀、财经方向稿 ×2、模板）已按取舍标准移除。');

  var plan = DOCS.filter(function (d) { return d.category === '培养方案'; });
  if (plan.length) h += '<div class="doc-list">' + plan.map(function (d) { return docCard(d, ''); }).join('') + '</div>';

  h += sec('教学安排计划表（培养方案原文）');
  h += '<div class="table-scroll"><table class="t"><thead><tr><th>序号</th><th>课程名称</th><th>开课学期</th>' +
    '<th>学分</th><th>总学时</th><th>理论</th><th>实践</th><th>任课教师</th><th>齐备度</th></tr></thead><tbody>';
  COURSES.forEach(function (c) {
    h += '<tr><td>' + c.no + '</td><td class="wrap"><a href="#/course/' + c.id + '">' +
      esc(c.name) + '</a></td><td>' + esc(c.planTerm || semLabel(c.sem)) + '</td><td>' + c.credit +
      '</td><td>' + c.hours + '</td><td>' + c.theory + '</td><td>' + c.practice + '</td>' +
      '<td>' + esc(c.teacher || '未排课') + '</td><td><a href="#/course/' + c.id + '">' +
      (COMP[c.id] || {}).score + '%</a></td></tr>';
  });
  h += '<tr><td colspan="3"><b>总计</b></td><td><b>' + STATS.credit + '</b></td><td><b>' +
    STATS.hours + '</b></td><td><b>' + (STATS.hours - STATS.practice) + '</b></td><td><b>' +
    STATS.practice + '</b></td><td colspan="2">6 门课程 / 2 个学期</td></tr></tbody></table></div>';

  h += sec('培养方案版本处置');
  h += '<p class="lead">同一用途只保留一份当前有效文件，历史版本、方向性草稿与模板不展示。</p>';
  h += '<div class="table-scroll"><table class="t"><thead><tr><th>文件</th><th>处置</th><th>依据</th></tr></thead><tbody>' +
    (D.programVersions || []).map(function (v) {
      return '<tr><td class="wrap mono tiny">' + esc(v.file) + '</td><td>' +
        badge(v.state, v.state === '唯一有效' ? 'teal' : 'gray') + '</td><td>' + esc(v.why) + '</td></tr>';
    }).join('') + '</tbody></table></div>';

  h += sec('口径核对与版本处置留痕');
  h += '<p class="lead">2026-11 已按培养方案 (6) 完成 6 门课程教学文档定稿；教学大纲 / 教学日历 / 教案 / ' +
    '考核评价标准中的课程名与英文名称均已统一。以下仅保留仍待外部确认的差异与已排除文件的历史冲突留痕。</p>';
  h += note('ok', '<b>已核定：</b>C2「业务场景应用」→「财经场景应用」；' +
    'C3「Python业务场景应用编程」→「Python 财经应用编程」；' +
    'C4「数据分析与可视化」→「数据分析与财经可视化」。' +
    '旧版同用途文件已由定稿版原地替换，网站不再重复展示两份文件。');
  h += note('warn', '<b>仍待确认：</b>教学任务表 xlsx 原文件中的课程名沿用旧表述' +
    '（该表为教务原始文件，本站未作修改），待教务更新后同步课程号与排课信息。');
  var nums = (D.audit || {}).numeric || [];
  if (nums.length) {
    h += sub('已排除文件中的学分 / 学时数字冲突（留痕）');
    h += '<div class="table-scroll"><table class="t"><thead><tr><th>文件</th><th>适用课程</th><th>文件内数值</th><th>培养方案 (6)</th></tr></thead><tbody>' +
      nums.map(function (x) {
        return '<tr><td class="wrap tiny">' + esc(x.source) + '</td><td>' + esc(x.course) +
          '</td><td>' + badge(x.found, 'warn') + '</td><td>' + esc(x.official) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    h += '<p class="tiny muted">注：上述冲突均来自按取舍标准排除的历史文件，不影响当前定稿文档；此处仅作版本处置留痕。</p>';
  }

  h += sec('排课与任务信息');
  COURSES.filter(function (c) { return c.task; }).forEach(function (c) {
    var t = c.task;
    h += '<div class="card"><b>' + esc(c.name) + '</b><div class="tiny" style="margin-top:6px">' +
      '任课教师 ' + esc(t['任课老师']) + '　·　工号 ' + esc(t['工号']) + '　·　报名 ' +
      esc(t['报名人数']) + ' 人　·　上课时间 ' + esc(t['上课时间']) + '　·　教室 ' +
      esc(t['教室特殊要求备注']) + '　·　课程号「' + esc(t['课程号']) + '」</div>' +
      (t['课程名'] !== c.name ? '<div class="tiny warn-text" style="margin-top:5px">教学任务表原文件课程名为「' +
        esc(t['课程名']) + '」；定稿教学文档已统一为培养方案 (6) 名称，待教务更新任务表。</div>' : '') + '</div>';
  });
  h += note('warn', '教学任务表仅覆盖第 1 学期 4 门课程；C5、C6 尚无正式排课记录。' +
    '本站已提供《第 2 学期教学任务建议表（C5-C6）》作为排课准备，任课教师、课程编码、上课时间与教室待教务确认。');

  h += sec('建设参考：政策坐标与课程结构');
  h += '<p class="lead">以下要点提取自「微专业PPT总结」的 6 份高校 / 企业建设报告，用于印证本校课程设置的政策背景与结构思路。</p>';
  h += practiceThemes(['policy', 'structure']);
  h += note('info', '<b>边界说明：</b>' + esc(BP.boundary));
  return h;
}

/* ---------------- 视图：课程档案 ---------------- */
function viewCourse(id) {
  var c = courseById(id);
  var v = COMP[id];
  if (!v) return note('warn', '未找到该课程。') + '<a class="btn" href="#/dashboard">返回总览</a>';
  var docs = DOCS.filter(function (d) { return d.course === id; });

  var h = '<div class="course-head"><div class="top">' +
    '<div class="num">' + esc(('0' + c.no).slice(-2)) + '</div>' +
    '<div class="ch-main"><h1>' + esc(c.name) + '</h1><div class="sub">' +
    esc(c.planTerm || semLabel(c.sem)) + '　·　编号 ' + esc(id) +
    '　·　在库资料 ' + docs.length + ' 份</div></div>' +
    '<span class="lvl lvl-' + (v.score >= 80 ? 'good' : v.score >= 40 ? 'mid' : 'low') + '">' +
    esc(v.level) + '</span></div>';
  h += '<div class="kv-grid">' +
    '<div class="it"><span>学分</span><b>' + c.credit + '</b></div>' +
    '<div class="it"><span>总学时</span><b>' + c.hours + '</b></div>' +
    '<div class="it"><span>理论 / 实践</span><b>' + c.theory + ' / ' + c.practice + '</b></div>' +
    '<div class="it"><span>任课教师</span><b>' + esc(c.teacher || '未排课') + '</b></div></div>';
  h += readinessBar(v.score, v.level);
  h += '</div>';

  h += sec('一、资料完整性核查');
  h += note('info', '以下为<b>课程管理口径判断</b>（依据必备资料清单与实际归档文件比对），' +
    '不是培养方案原文；「缺失范围 / 待补充内容 / 可能影响」用于指导补档，不代表课程未实际开设。');
  h += '<div class="check-list">' + v.items.map(checkItem).join('') + '</div>';
  (v.notes || []).forEach(function (n) { h += note('warn', esc(n)); });

  h += sec('二、课程信息（培养方案 (6) 原文）');
  h += '<div class="card"><h3 class="sub" style="margin-top:0">课程目标</h3><p style="margin:0">' +
    esc(c.goal) + '</p><h3 class="sub">核心内容</h3><ul class="clean">' +
    (c.contentList || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
    '<h3 class="sub">教学方式</h3><p style="margin:0">' + esc(c.method) + '</p>' +
    '<h3 class="sub">考核方式</h3><p style="margin:0">' + esc(c.assessment) + '</p>' +
    '<div class="src-line">来源：' + esc(c.introSource) + '；学分学时与开课学期取自「五、教学安排计划表」。</div></div>';

  h += sec('三、已归档课程资料');
  h += '<p class="lead">共 ' + docs.length + ' 份（均为按取舍标准纳入的当前有效或待核文件）。' +
    '<a href="#/library?' + qs({ course: id }) + '">在资料库中筛选 →</a></p>';
  if (!docs.length) {
    h += '<div class="empty-state">本课程暂无按取舍标准纳入的归档资料，全部资料类型均列为待补。</div>';
  } else {
    var byCat = {};
    docs.forEach(function (d) { (byCat[d.category] = byCat[d.category] || []).push(d); });
    Object.keys(byCat).sort().forEach(function (cat) {
      h += sub(cat + '（' + byCat[cat].length + '）');
      h += '<div class="table-scroll"><table class="t"><thead><tr><th style="width:34px">#</th>' +
        '<th>文件名</th><th>版本 / 状态</th><th>来源</th><th style="width:210px">操作</th></tr></thead><tbody>';
      byCat[cat].forEach(function (d) {
        h += '<tr><td class="tiny muted">' + esc(d.id.slice(1)) + '</td>' +
          '<td class="wrap"><b>' + esc(d.filename) + '</b>' +
          (d.notes && d.notes.length ? '<div class="tiny muted">' + esc(d.notes[0]) + '</div>' : '') + '</td>' +
          '<td class="tiny">' + esc(d.versionLabel) + '<br>' +
          badge(d.effective, d.effective === '待核' ? 'warn' : 'teal') + '</td>' +
          '<td class="tiny wrap">' + esc(d.source) + '</td><td>' + docActions(d) + '</td></tr>';
      });
      h += '</tbody></table></div>';
    });
  }
  if (id === 'C5' || id === 'C6') {
    h += sec('建设参考：产教融合与项目实战');
    h += '<p class="lead">本课程为第 2 学期项目实战类课程，以下为同类建设经验中对项目组织与双导师评审的可借鉴做法。</p>';
    h += practiceThemes(['industry'], true);
    h += note('info', '<b>边界说明：</b>' + esc(BP.boundary));
  }
  return h;
}

/* ---------------- 视图：完整性核查总页 ---------------- */
function viewCompleteness() {
  var h = '<div class="hero" style="padding:24px 30px"><div class="eyebrow">课程管理 · 建档状态</div>' +
    '<h1 style="font-size:23px">资料完整性核查</h1>' +
    '<p>逐门课程按 6 类必备资料核查，明确缺失范围、待补充内容与可能影响。平均齐备度 ' +
    STATS.avgReady + '%，共 ' + STATS.actions + ' 项待办。</p></div>';
  h += note('warn', '<b>口径说明：</b>「必备资料清单」为本网站采用的课程管理核查口径；' +
    '「缺失范围 / 待补充内容 / 可能影响」为依据实际归档情况作出的管理判断，' +
    '<b>不是培养方案原文，也不代表课程未实际开设</b>。页面不补写、不虚构任何课程内容。');

  h += sec('一、全课程核查矩阵');
  h += matrixTable();

  h += sec('二、逐门课程核查明细');
  COURSES.forEach(function (c) {
    var v = COMP[c.id];
    h += '<div class="card" style="padding:0;overflow:hidden">' +
      '<div class="course-strip"><a href="#/course/' + c.id + '"><b>' +
      esc(c.id + ' ' + c.name) + '</b></a><span>' + semLabel(c.sem) + ' · ' +
      c.credit + ' 学分 / ' + c.hours + ' 学时</span>' +
      '<span class="lvl lvl-' + (v.score >= 80 ? 'good' : v.score >= 40 ? 'mid' : 'low') + '">' +
      esc(v.level + ' ' + v.score + '%') + '</span>' +
      '<a class="btn" href="#/course/' + c.id + '">课程档案 →</a></div>' +
      '<div style="padding:4px 18px 16px"><div class="table-scroll"><table class="t"><thead><tr>' +
      '<th>资料类型</th><th>状态</th><th>缺失范围</th><th>待补充内容</th><th>可能影响</th></tr></thead><tbody>' +
      v.items.map(function (it) {
        return '<tr><td><b>' + esc(it.name) + '</b><div class="tiny muted">' +
          (it.found.length ? it.found.length + ' 份在库' : '无归档') + '</div></td>' +
          '<td>' + statusBadge(it.status) + '</td>' +
          '<td class="wrap tiny">' + esc(it.missingRange || '—') + '</td>' +
          '<td class="wrap tiny">' + esc(it.toAdd || '—') + '</td>' +
          '<td class="wrap tiny">' + esc(it.impact || '—') + '</td></tr>';
      }).join('') + '</tbody></table></div></div></div>';
  });

  h += sec('三、核查口径定义');
  h += '<div class="table-scroll"><table class="t"><thead><tr><th>必备资料类型</th><th>核查要求</th>' +
    '<th>状态判定</th></tr></thead><tbody>' + REQ.map(function (t) {
      return '<tr><td><b>' + esc(t.name) + '</b></td><td class="wrap tiny">' + esc(t.desc) +
        '</td><td class="tiny">有文件且口径一致 → 齐备；有文件但命名 / 版本 / 课次覆盖待核 → 不完整；无归档文件 → 缺失</td></tr>';
    }).join('') + '</tbody></table></div>';
  h += sec('建设参考：多元评价与质量闭环');
  h += '<p class="lead">以下为同类建设经验中关于评价尺度与质量反馈的做法，用于改进本站核查与考核文档的编制口径。</p>';
  h += practiceThemes(['evaluation'], true);
  h += note('info', '<b>口径区分：</b>本站逐门完整性核查属于课程档案管理口径；学生成绩评价以各课程《考核评价标准》与培养方案 (6) 为准，两套口径不混用。');
  return h;
}

/* ---------------- 视图：课程资料库 ---------------- */
function viewLibrary(r) {
  var p = r.params;
  var q = (p.q || '').trim();
  var course = p.course || '', cat = p.cat || '', eff = p.eff || '', ext = p.ext || '';
  var page = Math.max(1, parseInt(p.page || '1', 10) || 1);
  var per = 20;
  var exts = {};
  DOCS.forEach(function (d) { exts[d.ext] = 1; });

  var h = '<div class="hero" style="padding:22px 28px"><div class="eyebrow">准入资料</div>' +
    '<h1 style="font-size:22px">课程资料库</h1>' +
    '<p>仅收录按取舍标准纳入的 ' + DOCS.length + ' 份当前有效 / 待核资料；' +
    '历史版本、重复材料、学生作业与关联课程资料已排除。</p></div>';

  h += '<div class="filters"><div class="row">' +
    '<input type="text" id="fq" placeholder="检索文件名、来源或全文内容…" value="' + esc(q) + '">' +
    '<button class="btn solid" id="fsearch">检索</button>' +
    '<a class="btn gray" href="#/library">重置</a></div>' +
    '<div class="row">' +
    '<label>课程</label><select id="fcourse"><option value="">全部课程</option>' +
    COURSES.map(function (c) { return '<option value="' + c.id + '"' + (course === c.id ? ' selected' : '') +
      '>' + esc(c.id + ' ' + c.name) + '</option>'; }).join('') +
    '<option value="P"' + (course === 'P' ? ' selected' : '') + '>专业级基线</option></select>' +
    '<label>类型</label><select id="fcat"><option value="">全部类型</option>' +
    Object.keys(STATS.byCategory || {}).sort().map(function (c) {
      return '<option value="' + esc(c) + '"' + (cat === c ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('') + '</select>' +
    '<label>状态</label><select id="feff"><option value="">全部</option>' +
    '<option value="当前有效"' + (eff === '当前有效' ? ' selected' : '') + '>当前有效</option>' +
    '<option value="待核"' + (eff === '待核' ? ' selected' : '') + '>待核</option></select>' +
    '<label>格式</label><select id="fext"><option value="">全部</option>' +
    Object.keys(exts).sort().map(function (e) {
      return '<option value="' + esc(e) + '"' + (ext === e ? ' selected' : '') + '>' +
        esc(e.toUpperCase()) + '</option>';
    }).join('') + '</select></div></div>';

  var list = DOCS.filter(function (d) {
    if (course && d.course !== course) return false;
    if (cat && d.category !== cat) return false;
    if (eff && d.effective !== eff) return false;
    if (ext && d.ext !== ext) return false;
    if (q) {
      var hay = (d.title + ' ' + d.filename + ' ' + d.source + ' ' + d.category + ' ' +
        courseName(d.course) + ' ' + d.versionLabel + ' ' + (d.search || '')).toLowerCase();
      if (hay.indexOf(q.toLowerCase()) < 0) return false;
    }
    return true;
  });
  var pages = Math.max(1, Math.ceil(list.length / per));
  if (page > pages) page = pages;
  var slice = list.slice((page - 1) * per, page * per);

  h += '<p class="lead">命中 <b>' + list.length + '</b> 份' + (q ? '，关键词「' + esc(q) + '」' : '') +
    '　·　第 ' + page + ' / ' + pages + ' 页</p>';
  h += '<div class="doc-list">' + (slice.length ? slice.map(function (d) { return docCard(d, q); }).join('')
    : '<div class="empty-state">没有符合条件的资料。<a href="#/library">重置筛选</a></div>') + '</div>';
  if (pages > 1) {
    h += '<div class="pager"><button data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') +
      '>← 上一页</button>';
    for (var i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
      h += '<button data-page="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + i + '</button>';
    }
    h += '<button data-page="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') +
      '>下一页 →</button></div>';
  }
  h += note('info', '另有 ' + EXCLUDED.total + ' 份资料按取舍标准不进入资料库。' +
    '<a href="#/governance">查看排除原因与清单 →</a>');
  return h;
}

/* ---------------- 视图：内容取舍与治理 ---------------- */
function viewGovernance() {
  var h = '<div class="hero" style="padding:24px 30px"><div class="eyebrow">资料治理 · 可追溯</div>' +
    '<h1 style="font-size:23px">内容取舍标准与治理说明</h1>' +
    '<p>明确「什么进入课程资料库、什么不进入、为什么」，全部处置留痕，原始文件保留在工作空间供复核。</p></div>';

  h += note('ok', '<b>处置原则：</b>' + esc(STANDARD.scopeNote) +
    '　原始盘点 ' + (STATS.inventoryTotal || 339) + ' 份（原始准入 ' +
    (STATS.included - (STATS.newDocs || 0)) + ' / 排除 ' + EXCLUDED.total + '），' +
    '本轮新增定稿 ' + (STATS.newDocs || 0) + ' 份，当前在库 ' + STATS.included + ' 份。');

  h += sec('一、内容取舍标准');
  h += '<div class="card"><b>判定原则</b><ol class="clean" style="margin-top:8px">' +
    (STANDARD.principle || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
    '</ol></div>';
  h += '<div class="card"><b>纳入范围</b><ul class="clean">' +
    (STANDARD.include || []).map(function (x) {
      return '<li><b>' + esc(x.label) + '</b>：' + esc(x.desc) + '</li>';
    }).join('') + '</ul></div>';

  h += sec('二、排除清单（' + EXCLUDED.total + ' 份）');
  h += '<p class="lead">按主原因单一归类，便于核对处置口径；同一份文件不重复计入多组。</p>';
  h += '<div class="grid2">' + (EXCLUDED.groups || []).map(function (g) {
    return '<div class="card"><div style="display:flex;align-items:center;gap:8px">' +
      '<b>' + esc(g.name) + '</b>' + badge(g.count + ' 份', 'warn') + '</div>' +
      '<p class="tiny" style="margin:8px 0 6px;color:var(--ink2)">' + esc(g.why) + '</p>' +
      '<div class="mono tiny muted">' + (g.examples || []).map(esc).join('<br>') + '</div></div>';
  }).join('') + '</div>';
  h += '<details class="fold"><summary>展开查看全部 ' + EXCLUDED.total +
    ' 条排除记录（编号 / 分组 / 文件名 / 原因）</summary>' +
    '<div class="table-scroll"><table class="t"><thead><tr><th>编号</th><th>分组</th>' +
    '<th>文件名</th><th>原因</th></tr></thead><tbody>' +
    (EXCLUDED.records || []).map(function (x) {
      return '<tr><td class="tiny">' + esc(x.id) + '</td><td class="tiny">' + esc(x.group) +
        '</td><td class="wrap tiny">' + esc(x.filename) + '</td>' +
        '<td class="wrap tiny">' + esc(x.why) + '</td></tr>';
    }).join('') + '</tbody></table></div></details>';

  h += sec('三、培养方案版本处置');
  h += '<p class="lead">9 份培养方案相关文件中，仅 (6) 版为当前有效版本并参与全站课程信息展示。</p>';
  h += '<div class="table-scroll"><table class="t"><thead><tr><th>文件</th><th>处置</th><th>依据</th></tr></thead><tbody>' +
    (D.programVersions || []).map(function (v) {
      return '<tr><td class="wrap mono tiny">' + esc(v.file) + '</td><td>' +
        badge(v.state, v.state === '唯一有效' ? 'teal' : 'gray') + '</td><td>' + esc(v.why) + '</td></tr>';
    }).join('') + '</tbody></table></div>';

  h += sec('四、其他待核事项');
  h += '<div class="card"><ul class="clean">' +
    (D.governanceNotes || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') +
    '</ul></div>';
  var nums = (D.audit || {}).numeric || [];
  if (nums.length) {
    h += sub('已排除文件中的数字冲突（留痕）');
    h += '<div class="table-scroll"><table class="t"><thead><tr><th>文件</th><th>适用课程</th>' +
      '<th>文件内数值</th><th>培养方案 (6)</th></tr></thead><tbody>' +
      nums.map(function (x) {
        return '<tr><td class="wrap tiny">' + esc(x.source) + '</td><td>' + esc(x.course) +
          '</td><td>' + badge(x.found, 'warn') + '</td><td>' + esc(x.official) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  h += sec('五、资料来源与网站结构');
  (META.sources || []).forEach(function (s) {
    h += '<div class="card"><b>' + esc(s.label) + '</b><div class="mono tiny muted" style="margin:4px 0">' +
      esc(s.file) + '</div><div class="tiny">' + esc(s.use) + '</div></div>';
  });
  h += '<div class="grid3">' + (D.refs || []).map(function (r) {
    return '<div class="card"><b>' + esc(r.name) + '</b>' +
      '<div class="mono tiny" style="margin:6px 0;color:var(--brand)"><a href="' + esc(r.url) +
      '" target="_blank" rel="noopener">' + esc(r.url) + '</a></div>' +
      '<div class="tiny">' + esc(r.use) + '</div></div>';
  }).join('') + '</div>';
  h += note('info', '<b>本次重构的网站结构：</b>管理总览（课程健康度 / 待办）→ 课程设置与基线 → ' +
    '课程档案（逐门完整性核查）→ 完整性核查总页 → 课程资料库 → 内容取舍与治理。' +
    '导航以课程与管理任务为主线，不再按空间目录或资料数量组织。');
  h += sec('六、管理资料包下载');
  h += '<div class="card"><div class="btnrow">' +
    '<a class="btn solid" href="' + encodeURI('课程管理资料包（准入版）.zip') + '" download>' +
    '课程管理资料包（' + STATS.included + ' 份 Word · 按课程归类）</a>' +
    '<a class="btn" href="' + encodeURI('课程资料管理状态清单.md') + '" download>课程资料管理状态清单（Markdown）</a>' +
    '</div><p class="tiny muted" style="margin:9px 0 0">资料包仅含按取舍标准纳入的当前有效 / 待核资料，' +
    '并附逐门完整性核查与排除说明；被排除的历史版本、重复材料与学生作业不在包内。</p></div>';
  h += note('warn', '<b>下载环境说明：</b>内置静态预览服务仅开放网页类资源，.docx / .zip 等二进制下载可能被拦截；' +
    '请从本地目录 <span class="mono">D:/project/微专业/微专业全景网站/</span> 打开 index.html，' +
    '或使用会话中提供的「课程管理资料包」卡片下载。');
  h += sec('七、建设参考与最佳实践（外部资料）');
  h += '<p class="lead">' + esc(BP.intro) + '</p>';
  h += practiceThemes(['governance', 'roadmap']);
  h += sub('资料来源（' + (BP.sources || []).length + ' 项 · ' + esc(BP.sourceDir || '') + '）');
  h += bpSources();
  h += note('warn', '<b>口径边界：</b>' + esc(BP.boundary));
  h += note('info', '<b>融入位置：</b>政策坐标与课程结构 → 课程设置与基线；产教融合与项目实战 → 课程档案 C5 / C6；' +
    '多元评价与质量闭环 → 资料完整性核查；制度规范与路线图要点 → 本页。' +
    '全部沿用现有区块、卡片与提示块样式，未新增导航路由，页面结构与表达风格保持一致。');
  if (WKP.title) {
    h += sec('八、48 学时课程 · 单周 / 双周列示口径');
    h += '<p class="lead">' + esc(WKP.short) + '</p>';
    h += parityBlock();
    h += '<p class="tiny muted" style="margin:9px 0 0">适用课程：' + esc(WKP.scope) +
      '；规则定义：<span class="mono">' + esc(WKP.source) + '</span>。' +
      '教学大纲汇编网页的「单双周口径」专节与本页口径一致。</p>';
  }
  return h;
}

/* ---------------- 渲染 ---------------- */
function render() {
  var r = parseRoute();
  var h = '';
  switch (r.view) {
    case 'program': h = viewProgram(); break;
    case 'course': h = viewCourse(r.id); break;
    case 'completeness': h = viewCompleteness(); break;
    case 'library': h = viewLibrary(r); break;
    case 'governance': h = viewGovernance(); break;
    default: h = viewDashboard();
  }
  // 关联页面入口为静态骨架，路由重渲染时保持在正文最前，位置与另外两个 index 页面一致
  var peer = document.querySelector('#main > .peer-nav');
  $('#main').innerHTML = (peer ? peer.outerHTML : '') + h;
  renderNav(r);
  renderToc(r);
  bindMain(r);
  window.scrollTo(0, 0);
  closeSidebar();
}

function bindMain(r) {
  Array.prototype.forEach.call(document.querySelectorAll('[data-preview]'), function (b) {
    b.addEventListener('click', function () { openPreview(b.getAttribute('data-preview')); });
  });
  if (r.view !== 'library') return;
  function apply(over) {
    var o = {
      q: ($('#fq') || {}).value || '',
      course: ($('#fcourse') || {}).value || '',
      cat: ($('#fcat') || {}).value || '',
      eff: ($('#feff') || {}).value || '',
      ext: ($('#fext') || {}).value || ''
    };
    Object.keys(over || {}).forEach(function (k) { o[k] = over[k]; });
    go('#/library?' + qs(o));
  }
  ['fcourse', 'fcat', 'feff', 'fext'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function () { apply({}); });
  });
  var fs = $('#fsearch'); if (fs) fs.addEventListener('click', function () { apply({}); });
  var fq = $('#fq');
  if (fq) fq.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); apply({}); }
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-page]'), function (b) {
    b.addEventListener('click', function () {
      if (b.disabled) return;
      apply({ page: b.getAttribute('data-page'), q: ($('#fq') || {}).value || '' });
    });
  });
}

/* ---------------- 预览弹窗 ---------------- */
function openPreview(id) {
  var d = docMap[id];
  if (!d) return;
  $('#modalTitle').textContent = d.title;
  $('#modalFrame').src = d.preview;
  $('#modalWord').href = d.word;
  $('#modalOpen').href = d.preview;
  var og = $('#modalOrig');
  if (d.original) { og.style.display = ''; og.href = d.original; } else og.style.display = 'none';
  $('#modal').classList.add('on');
  document.body.style.overflow = 'hidden';
}
function closePreview() {
  $('#modal').classList.remove('on');
  $('#modalFrame').src = 'about:blank';
  document.body.style.overflow = '';
}

/* ---------------- 全局检索 ---------------- */
function showSuggest(q) {
  var box = $('#suggest');
  q = q.trim();
  if (!q) { box.classList.remove('on'); return; }
  var out = [];
  for (var i = 0; i < DOCS.length && out.length < 9; i++) {
    var d = DOCS[i];
    if ((d.title + ' ' + d.filename + ' ' + d.source + ' ' + (d.search || ''))
        .toLowerCase().indexOf(q.toLowerCase()) >= 0) out.push(d);
  }
  box.innerHTML = out.length ? out.map(function (d) {
    return '<a href="#" data-doc="' + esc(d.id) + '"><b>' + esc(d.title.slice(0, 60)) + '</b>' +
      '<span>' + esc(d.category + ' · ' + courseName(d.course) + ' · ' + d.source) + '</span></a>';
  }).join('') + '<a href="#/library?' + qs({ q: q }) + '">在课程资料库中查看全部结果 →</a>'
    : '<div class="empty">在库资料中没有匹配项。按回车进入资料库查看筛选条件。</div>';
  box.classList.add('on');
  Array.prototype.forEach.call(box.querySelectorAll('[data-doc]'), function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); box.classList.remove('on');
      openPreview(a.getAttribute('data-doc'));
    });
  });
}

function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#scrim').classList.remove('on');
}
function toast(msg) {
  var t = $('#toast'); t.textContent = msg; t.classList.add('on');
  setTimeout(function () { t.classList.remove('on'); }, 1800);
}

function init() {
  render();
  window.addEventListener('hashchange', render);
  $('#menuBtn').addEventListener('click', function () {
    $('#sidebar').classList.toggle('open');
    $('#scrim').classList.toggle('on');
  });
  $('#scrim').addEventListener('click', closeSidebar);
  $('#modalClose').addEventListener('click', closePreview);
  $('#modal').addEventListener('click', function (e) {
    if (e.target.id === 'modal') closePreview();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closePreview(); $('#suggest').classList.remove('on'); closeSidebar(); }
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === '/' && tag !== 'input' && tag !== 'textarea' && tag !== 'select') {
      e.preventDefault(); $('#globalSearch').focus();
    }
  });
  var gs = $('#globalSearch');
  gs.addEventListener('input', function () { showSuggest(gs.value); });
  gs.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault(); $('#suggest').classList.remove('on');
      go('#/library?' + qs({ q: gs.value.trim() }));
      gs.blur();
    }
  });
  gs.addEventListener('focus', function () { if (gs.value.trim()) showSuggest(gs.value); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-wrap')) $('#suggest').classList.remove('on');
  });
  if (!DOCS.length) toast('未读取到课程资料数据，请确认 data.js 存在');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
})();
