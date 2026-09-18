// 常用导航：七组（学校相关 / 考试报名 / 学习网站 / 效率工具 / 装机软件 / 游戏娱乐 / AI 工具）
// 原则：只收录站长真实用过、认可的内容；desc 保持一行内，细节放点击弹窗（note）
// note 段式：【是什么】【怎么装】【提醒】，带「💡 站长使用」的才是站长真实案例
// icon: 条目功能图标（emoji），未写则用分组默认
// confirm: true = 网址待站长核对（页面显示「待确认」小标）
// wechat / app / noLink: 无网页链接的特殊项（灰显 + 说明标签）
// until: 'YYYY-MM-DD' = 新生期专属项，过了该日期自动隐藏（明年迎新前改日期即可）
// note: [说明行数组] = 点击先弹介绍页，勾「不再显示」后下次直接跳转
const LINK_SITES = [
  {
    "cat": "🏫 学校相关",
    "items": [
      { "name": "学校官网", "icon": "🏫", "url": "https://www.hfit.edu.cn", "desc": "学校通知、新闻、办事指南入口" },
      { "name": "学校官方公众号", "icon": "💬", "desc": "微信搜索「合肥理工学院」关注", "wechat": true },
      { "name": "智慧合理工 APP", "icon": "📱", "desc": "迎新报到、自选宿舍、课表缴费（新生期）", "app": true, "until": "2026-10-08" }
    ]
  },
  {
    "cat": "📝 考试报名",
    "items": [
      { "name": "四六级考试（CET）", "icon": "📝", "url": "https://cet.neea.edu.cn", "desc": "考试大纲、准考证打印、成绩查询", "note": [
        "<b>报名入口</b>是另一个地址：cet-bm.neea.edu.cn，报名只在报名开放期可用。",
        "<b>报名前</b>需先注册学信网账号，并完成学籍校验。",
        "每年 6 月和 12 月各考一次，报名一般在 3 月和 9 月中旬开始，<b>报满即止</b>。",
        "报名当天网站经常挤爆，早几分钟守着；错过这次就要再等半年。"
      ] },
      { "name": "学信网", "icon": "🎓", "url": "https://www.chsi.com.cn", "desc": "查学籍、四六级报名资格、学历认证", "note": [
        "查学籍状态、四六级报名资格、学历认证都在这里，网页直接用，不用下 APP。",
        "账号和密码一定保管好，这个账号跟你到毕业以后（找工作、考研都要用）。"
      ] },
      { "name": "全国计算机等级考试", "icon": "🖱️", "url": "https://ncre.neea.edu.cn", "desc": "计算机一二级报名与成绩查询", "note": [
        "计算机一二级的报名与成绩查询，考公务员、部分专业和单位用得上。",
        "二级科目（如 MS Office、Python）选和自己专业相关的，备考题库网上很多。"
      ] }
    ]
  },
  {
    "cat": "📚 学习网站",
    "items": [
      { "name": "中国大学 MOOC", "icon": "📖", "url": "https://www.icourse163.org", "desc": "名牌大学公开课，高数线代来这补", "note": [
        "<b>是什么</b>：网易和高教社合办的慕课平台，清华、北大等名校课程免费看，部分课程有结业证书。",
        "课上没听懂的知识点，来这搜同名课程换个老师讲，往往一遍就通。"
      ] },
      { "name": "B 站", "icon": "📺", "url": "https://www.bilibili.com", "desc": "学习区搜课程名，教程全都有", "note": [
        "<b>是什么</b>：不只是娱乐平台，学习区内容极丰富——高数、四六级、编程、软件教程全都有。",
        "搜「课程名 + 大学名」或「课程名 + 完整版」，挑播放量高、合集完整的看。"
      ] },
      { "name": "国家高等教育智慧教育平台", "icon": "🏛️", "url": "https://higher.smartedu.cn", "desc": "教育部官方课程平台，全部免费", "note": [
        "<b>是什么</b>：教育部官方的高等教育课程平台，汇聚全国高校优质课程，全部免费。",
        "权威可靠无广告，适合当 B 站 / MOOC 之外的补充。"
      ] },
      { "name": "GitHub", "icon": "🐙", "url": "https://github.com", "desc": "看开源项目、找学习资源、托管代码", "note": [
        "<b>是什么</b>：全球最大代码托管平台，写代码的同学四年都离不开——看开源项目、找学习资源、托管自己的代码。",
        "<b>💡 站长使用</b>：我有一些开源项目就托管在上面，学习笔记和写的小工具也会传上去。",
        "<b>提醒</b>：国内直连慢或打不开时，用 Watt Toolkit 加速（见装机软件组）。"
      ] },
      { "name": "菜鸟教程", "icon": "🐦", "url": "https://www.runoob.com", "desc": "编程入门文档，查语法最快", "note": [
        "<b>是什么</b>：中文编程入门文档库，C / Python / HTML / SQL 等语言的语法和示例都很全，例子还能在线运行。",
        "写代码忘了语法别翻书，来这里搜最快；每个知识点都有「尝试一下」在线编辑。"
      ] },
      { "name": "知网 CNKI", "icon": "📚", "url": "https://www.cnki.net", "desc": "写论文查文献（进站前先看建议）", "note": [
        "连 <b>校园网</b> 后可通过「机构登录 / IP 范围」免费下载文献，不需要自己付费。",
        "<b>建议用电脑访问</b>：检索和批量下载在电脑上体验好很多。",
        "手机临时查一两条也可以用，但下载中文 PDF 较麻烦。",
        "大一写课程论文就可以开始学着用，毕业论文跑不掉的，早点熟悉检索技巧。"
      ] }
    ]
  },
  {
    "cat": "🧰 效率工具",
    "groupNote": "站长真实在用的效率工具，点击看功能介绍与安装方法",
    "items": [
      { "name": "飞书", "icon": "📘", "url": "https://www.feishu.cn", "desc": "笔记 + 共享文档，小组协作利器", "note": [
        "<b>是什么</b>：字节的协作平台，云文档、共享笔记、多维表格都在一个地方，个人版免费。",
        "<b>怎么装</b>：网页直接用，手机 APP / 电脑客户端按需下载。",
        "<b>💡 站长使用</b>：我主要拿它来做笔记和文档共享——小组作业建一个共享文件夹，大家同时编辑，不用来回传文件，多端实时同步。"
      ] },
      { "name": "Everything", "icon": "🔍", "url": "https://www.voidtools.com", "desc": "文件名秒搜工具",
        "note": [
          "<b>是什么</b>：按文件名搜索全盘文件，输入关键词立刻出结果，Windows 自带搜索完全比不了。",
          "<b>怎么装</b>：官网点「Download」下载安装版（Installer x64）。",
          "<b>💡 站长使用</b>：主要拿来搜电脑上的文件——课件、文档、代码，输入文件名的一部分立刻出结果，装完就离不开了。"
        ] },
      { "name": "7-Zip", "icon": "📦", "url": "https://www.7-zip.org", "desc": "免费无广告的解压软件",
        "note": [
          "<b>是什么</b>：免费开源的解压 / 压缩工具，zip、rar、7z 等格式全支持，无广告。",
          "<b>怎么装</b>：官网点「Download」下载 .exe 安装，64 位 Windows 选 x64.exe。",
          "交作业压缩成 zip 最稳妥（老师电脑一定能打开），别用冷门格式。"
        ] },
      { "name": "Snipaste", "icon": "📸", "url": "https://zh.snipaste.com", "desc": "截图 + 贴图工具",
        "note": [
          "<b>是什么</b>：截图工具，截完可以贴回屏幕上——对着写作业、抄配置、比对信息特别方便。",
          "<b>怎么装</b>：官网下载安装版。",
          "<b>怎么用</b>：<b>F1</b> 截图、<b>F3</b> 贴图，贴图可以缩放、半透明，不用了点右上角关闭。",
          "写作业时把题目截图贴在屏幕角落，一边看一边写，不用来回切窗口。"
        ] },
      { "name": "PowerToys", "icon": "🪟", "url": "https://learn.microsoft.com/zh-cn/windows/powertoys/", "desc": "微软官方效率套件，开源免费",
        "note": [
          "<b>是什么</b>：微软官方的 Windows 效率工具合集——窗口分屏（FancyZones）、屏幕取色、批量重命名、文字提取（OCR）等几十个功能。",
          "<b>怎么装</b>：在 Microsoft Store 搜「PowerToys」，或从官网文档页跳转 GitHub 下载。",
          "功能很多但按需启用就行，全开会占内存；最实用的是窗口分屏和文字提取（截图转文字）。"
        ] },
      { "name": "Geek Uninstaller", "icon": "🧹", "url": "https://geekuninstaller.com", "desc": "干净彻底的卸载工具",
        "note": [
          "<b>是什么</b>：卸载软件用，比系统自带的卸载干净得多。",
          "<b>怎么装</b>：官网点「Download」，下载的是绿色单文件，无需安装，双击直接用。",
          "<b>💡 站长使用</b>：专门拿来卸那些卸不掉的顽固软件——卸载完它会把注册表、残留文件一次性扫干净，强推。"
        ] },
      { "name": "Obsidian", "icon": "📓", "url": "https://obsidian.md", "desc": "本地 Markdown 笔记",
        "note": [
          "<b>是什么</b>：本地笔记软件，笔记以 .md 文件存在你自己电脑上，不锁在任何平台里，四年笔记攒一个库。",
          "<b>怎么装</b>：官网下载安装，打开后选一个文件夹作为「仓库」即可开始写。",
          "先当本地记事本用，上手零成本；笔记是自己的数据，不怕平台倒闭跑路。"
        ] },
      { "name": "TrafficMonitor", "icon": "📊", "url": "https://github.com/zhongyang219/TrafficMonitor", "desc": "任务栏网速 / CPU 监控小插件", "note": [
        "<b>是什么</b>：开源小插件，在任务栏显示实时网速、CPU / 内存占用，随时掌握电脑状态。",
        "<b>怎么装</b>：从 GitHub 页面下载最新 Release，解压后运行 exe 即可。",
        "<b>提醒</b>：上手门槛比一般软件高一些（要自己下对版本、配置显示项），<b>建议 B 站搜「TrafficMonitor 教程」</b>跟着做，几分钟搞定。"
      ] },
      { "name": "Wireshark", "icon": "🕵️", "url": "https://www.wireshark.org", "desc": "网络抓包工具", "note": [
        "<b>是什么</b>：网络抓包分析工具，能看到网络里到底在传什么数据——学网络协议、排查网络问题、课程实验都用它。",
        "<b>怎么装</b>：官网下载安装，一路下一步。",
        "<b>提醒</b>：上手门槛较高（要懂一点网络协议），<b>B 站搜「Wireshark 入门」</b>有大量教程。"
      ] },
      { "name": "中科大测速", "icon": "📶", "url": "https://test.ustc.edu.cn", "desc": "测宿舍 / 校园网的上行下行速度", "note": [
        "中科大的测速网站，打开选节点就能测宿舍 / 校园网的上行下行速度。",
        "网速慢的时候先来测一下，是网的问题还是电脑的问题，一测便知。"
      ] },
      { "name": "拓竹 3D 打印", "icon": "🖨️", "url": "https://www.bambulab.com/zh-cn", "desc": "拓竹 3D 打印机官网", "note": [
        "<b>是什么</b>：拓竹（Bambu Lab）3D 打印机官网，消费级 3D 打印机的头部品牌，开箱即用。",
        "<b>💡 站长使用</b>：我有时候玩 3D 打印，用的就是拓竹——打印模型、修个配件、做点小玩意都很方便，切片用官方 Bambu Studio。"
      ] },
      { "name": "Creality Print", "icon": "📐", "url": "https://www.creality.com", "desc": "创想三维 3D 打印切片软件", "note": [
        "<b>是什么</b>：创想三维的 3D 打印切片软件（站长用的 7.2 版），把 3D 模型转成打印路径。",
        "<b>提醒</b>：切片软件跟着打印机型号选——拓竹机用 Bambu Studio，创想机用 Creality Print，别装混。",
        "<b>💡 说明</b>：这条比较针对站长个人需求，有 3D 打印需求的同学再看。"
      ] }
    ]
  },
  {
    "cat": "🖥️ 装机软件",
    "groupNote": "全部官方直链——千万别用第三方「下载站」，捆绑全家桶重灾区。点击看功能介绍与安装方法",
    "items": [
      { "name": "火绒安全", "icon": "🛡️", "url": "https://www.huorong.cn", "desc": "干净不弹窗的安全软件",
        "note": [
          "<b>是什么</b>：杀毒 + 弹窗拦截 + 启动项管理，安静不骚扰，国内口碑最好的安全软件之一。",
          "<b>怎么装</b>：官网下载「火绒安全软件个人版」，双击安装即可。",
          "<b>💡 站长使用</b>：安全软件装这一个就足够了，<b>千万不要装 360</b>——捆绑、全家桶、弹窗，装了电脑只会越来越卡。"
        ] },
      { "name": "WPS Office", "icon": "📄", "url": "https://www.wps.cn", "desc": "文档 / 表格 / 幻灯片",
        "note": [
          "<b>是什么</b>：办公套件，学校作业常见的 doc / xls / ppt 格式都能打开和编辑。",
          "<b>怎么装</b>：官网下载「WPS Office」个人版。",
          "个人版免费够用；不想要推送弹窗可以在设置里关掉「WPS 热点」。"
        ] },
      { "name": "VS Code", "icon": "🧩", "url": "https://code.visualstudio.com", "desc": "轻量代码编辑器，理工科基本必备",
        "note": [
          "<b>是什么</b>：微软出的免费轻量代码编辑器，插件生态极强。",
          "<b>怎么装</b>：官网点「Download for Windows」，装完后进扩展市场（Ctrl+Shift+X）先装 <b>Chinese 中文语言包</b>。",
          "<b>💡 站长使用</b>：日常做代码编辑用的就是它——写 Python、改配置、看文档全在 VS Code 里，配合插件基本覆盖所有开发场景。"
        ] },
      { "name": "PyCharm", "icon": "🐍", "url": "https://www.jetbrains.com/zh-cn/pycharm/", "desc": "专业的 Python IDE，写大项目更省心", "note": [
        "<b>是什么</b>：JetBrains 出的 Python 专业 IDE，代码补全、调试、项目管理比轻量编辑器更强。",
        "<b>怎么装</b>：<b>Community 社区版免费</b>够学生用；专业版可以用学校 edu 邮箱申请学生授权免费。",
        "<b>提醒</b>：刚入门先用 VS Code + Python 就够，等写大一点的项目再上 PyCharm。"
      ] },
      { "name": "Python", "icon": "🐍", "url": "https://www.python.org", "desc": "官方解释器，编程课用得上",
        "note": [
          "<b>是什么</b>：Python 官方解释器，编程课、写小工具、做课程作业都用它。",
          "<b>怎么装</b>：官网 Downloads → Python 3.x 最新版。<b>安装第一步务必勾选「Add Python to PATH」</b>，否则命令行用不了。",
          "只从 python.org 官网下，某些下载站的「Python」带全家桶；装完在命令行输 python --version 能出版本号就是装好了。"
        ] },
      { "name": "Git", "icon": "🌿", "url": "https://git-scm.com", "desc": "版本控制工具，配合 GitHub 使用",
        "note": [
          "<b>是什么</b>：代码版本管理工具，记录每次改动、随时回退——用 GitHub 的前置软件，写代码迟早要装。",
          "<b>怎么装</b>：官网下载 Windows 版，一路默认下一步即可。",
          "装完先学三件事——add、commit、push，菜鸟教程（见学习网站）里的 Git 教程够入门。"
        ] },
      { "name": "Visual Studio", "icon": "🛠️", "url": "https://visualstudio.microsoft.com/zh-hans", "desc": "微软全家桶 IDE，C++ / C# 课程常用",
        "note": [
          "<b>是什么</b>：微软的大型 IDE，C++、C# 课程实验和课设常用。<b>它和 VS Code 是两个东西</b>，别装混。",
          "<b>怎么装</b>：官网下载 <b>Community 社区版（对学生免费）</b>，安装时按课程要求勾选工作负载（如「使用 C++ 的桌面开发」）。",
          "安装包很大（几 GB 到十几 GB），确保磁盘空间够，等课要用了再装也不迟。"
        ] },
      { "name": "MobaXterm", "icon": "🖥️", "url": "https://mobaxterm.mobatek.net", "desc": "全能终端，SSH 连服务器必备",
        "note": [
          "<b>是什么</b>：SSH / SFTP / 串口全能终端，远程连接服务器的基本工具。",
          "<b>怎么装</b>：官网下载 <b>Home 免费版</b>（Installer 安装版），免费版够学生用。",
          "<b>💡 站长使用</b>：参加比赛时用它 SSH 连接 Ubuntu 的小车（机器人）——远程调试、传文件全靠它，左侧自带 SFTP 文件栏，拖拽就能传。"
        ] },
      { "name": "ToDesk", "icon": "🔗", "url": "https://www.todesk.com", "desc": "远程控制电脑，手机也能连", "note": [
        "<b>是什么</b>：远程桌面工具，用另一台电脑或手机远程操作你的电脑，个人免费。",
        "<b>怎么装</b>：两台设备都装 ToDesk，记下设备代码和临时密码就能连。",
        "<b>💡 站长使用</b>：我的游戏本长期开机放宿舍，外出只带轻薄本——有问题就远程连回去，手机装 ToDesk 也能直接操控电脑，非常方便。"
      ] },
      { "name": "图吧工具箱", "icon": "🧰", "url": "https://www.tbtool.cn", "desc": "硬件检测工具合集，验机必备",
        "note": [
          "<b>是什么</b>：硬件检测工具大合集，CPU-Z、GPU-Z、AIDA64、CrystalDiskInfo 等几十个工具打包在一起，全免费无广告。",
          "<b>怎么装</b>：官网下载，绿色版解压即用。",
          "<b>💡 站长使用</b>：拿来验机、验屏幕——硬盘通电时间查新旧、屏幕坏点漏光检测、配置核对，买电脑 / 收二手第一步就是开图吧。"
        ] },
      { "name": "UU 加速器", "icon": "🚀", "url": "https://uu.163.com", "desc": "老牌游戏加速器（付费）", "note": [
        "<b>是什么</b>：网易家的游戏加速器，玩外服游戏、联机对战卡顿时用它，按月付费有免费时长活动。",
        "<b>和 Watt Toolkit 的区别</b>：Watt 主打免费网页加速（GitHub / Steam 商店），UU 主打游戏加速，按需选。"
      ] },
      { "name": "Steam", "icon": "🎮", "url": "https://store.steampowered.com", "desc": "游戏平台，劳逸结合",
        "note": [
          "<b>是什么</b>：全球最大的 PC 游戏平台，正版游戏都在这买。",
          "<b>怎么装</b>：官网右上角「安装 Steam」下载安装器。",
          "打不开 / 商店加载慢用 Watt Toolkit（下一条）加速；合理安排时间，别影响上课。"
        ] },
      { "name": "Watt Toolkit（原 Steam++）", "icon": "⚡", "url": "https://steampp.net", "desc": "开源免费网络加速工具",
        "note": [
          "<b>是什么</b>：开源免费的网络加速工具，GitHub、Steam 等网站直连慢 / 打不开时用它加速。",
          "<b>怎么装</b>：官网或页面里的 Gitee 镜像下载（国内下载快）。",
          "<b>💡 站长使用</b>：主要拿来加速 GitHub——直连经常超时，开 Watt Toolkit 勾选 GitHub 一键加速就稳了。"
        ] },
      { "name": "剪映专业版", "icon": "✂️", "url": "https://www.capcut.cn", "desc": "上手最快的电脑视频剪辑", "note": [
        "<b>是什么</b>：抖音官方剪辑软件，电脑版功能完整——剪辑、字幕、转场、素材库都有，新手友好。",
        "<b>怎么装</b>：官网下载「剪映专业版」（电脑版），免费。",
        "<b>提醒</b>：部分高级素材要会员，但日常作业视频、Vlog 免费功能完全够用。"
      ] },
      { "name": "必剪", "icon": "📼", "url": "https://bcut.bilibili.cn", "desc": "B 站官方剪辑软件", "note": [
        "<b>是什么</b>：B 站官方剪辑工具，和 B 站账号打通，做完直接投稿。",
        "<b>怎么装</b>：官网下载电脑版，或手机应用商店搜「必剪」。",
        "<b>提醒</b>：主打 B 站生态——一键投稿、录制高清录屏、虚拟主播素材，常投 B 站的选它最顺。"
      ] },
      { "name": "达芬奇（DaVinci Resolve）", "icon": "🎬", "url": "https://www.blackmagicdesign.com/products/davinciresolve", "desc": "好莱坞级剪辑调色，免费版够用", "note": [
        "<b>是什么</b>：专业级剪辑 + 调色软件，很多电影就用它调色；<b>免费版功能已经足够学生用</b>。",
        "<b>怎么装</b>：官网下载免费版（注意别下到付费 Studio 版，除非真的需要）。",
        "<b>提醒</b>：安装包大、对显卡有要求；想走视频方向的再深入，普通剪辑剪映就行。"
      ] },
      { "name": "PS / PR / SolidWorks 等专业软件", "icon": "🎨", "desc": "大型商业软件，需自行寻找资源", "noLink": true, "note": [
        "<b>是什么</b>：Photoshop（修图）、Premiere（剪辑）、SolidWorks（3D 建模）、AutoCAD 等大型商业软件，官网个人版收费。",
        "<b>资源去哪找</b>：没有官方免费直链，需要自行网上搜索——但第三方资源站是<b>捆绑重灾区</b>，下载后务必用火绒扫一遍再装。",
        "<b>提醒</b>：制图类课程老师通常也会发安装指导，等课要用了再装。"
      ] }
    ]
  },
  {
    "cat": "🎮 游戏娱乐",
    "groupNote": "劳逸结合，学业为主——游戏是放松，不是生活的全部，别沉迷",
    "items": [
      { "name": "瓦罗兰特（Valorant）", "icon": "🎯", "url": "https://valorant.qq.com", "desc": "拳头的战术射击，国服腾讯代理", "note": [
        "<b>是什么</b>： Riot 的 5v5 战术射击游戏，画风偏卡通、配置要求低，国服由腾讯代理。",
        "<b>怎么玩</b>：官网下载国服客户端，QQ / 微信账号直接登录。",
        "<b>提醒</b>：射击游戏都有门槛，先打人机练枪，合理安排时间。"
      ] },
      { "name": "CS2", "icon": "🔫", "url": "https://store.steampowered.com/app/730", "desc": "Steam 免费 CS 正统续作（原 CSGO）", "note": [
        "<b>是什么</b>：Valve 的 CS 正统续作（原 CSGO 免费升级），Steam 上免费下载。",
        "<b>怎么玩</b>：装 Steam（见装机软件组）→ 商店搜 CS2 → 免费入库；打不开商店用 Watt Toolkit 加速。",
        "<b>提醒</b>：想打正式对战需要配合对战平台（见下面两条）。"
      ] },
      { "name": "完美对战平台", "icon": "🎖️", "url": "https://pvp.wanmei.com", "desc": "CS2 用的对战平台", "note": [
        "<b>是什么</b>：CS2 用的对战平台，反作弊环境比社区服好，想认真打 CS 的基本都在平台上打。",
        "<b>怎么装</b>：官网下载客户端，注册账号绑定 Steam 的 CS2 即可使用。"
      ] },
      { "name": "5E 对战平台", "icon": "⚔️", "url": "https://www.5eplay.com", "desc": "CS2 用的对战平台", "note": [
        "<b>是什么</b>：CS2 用的对战平台，和完美平台功能定位相同。",
        "<b>怎么装</b>：官网下载客户端注册使用；和完美平台选一个用就行。"
      ] },
      { "name": "米哈游游戏", "icon": "🌌", "url": "https://www.mihoyo.com", "desc": "原神 / 星穹铁道 / 绝区零，官网下启动器", "note": [
        "<b>是什么</b>：原神、崩坏：星穹铁道、绝区零都是米哈游的游戏，官网下官方启动器。",
        "<b>怎么玩</b>：官网下载米哈游启动器，在启动器里选游戏下载；手机 PC 数据互通。",
        "<b>提醒</b>：免费游玩有内购；这类游戏很吃时间，注意安排。"
      ] },
      { "name": "我的世界（Minecraft）", "icon": "⛏️", "url": "https://mc.163.com", "desc": "沙盒游戏，国服网易代理", "note": [
        "<b>是什么</b>：全球最畅销的沙盒游戏——生存、建造、红石、模组玩法无限。",
        "<b>版本选择</b>：国服（网易代理，免费）在 mc.163.com 下载；国际 Java 版在 minecraft.net，需正版账号。",
        "<b>提醒</b>：Java 版入门门槛较高（版本、启动器、模组都是坑），<b>B 站搜「Minecraft 入门」</b>有大量教程。"
      ] },
      { "name": "PCL2 启动器", "icon": "🧩", "url": "https://github.com/Hex-Dragon/PCL2", "desc": "最流行的免费 Minecraft 启动器", "note": [
        "<b>是什么</b>：Plain Craft Launcher 2，国内最流行的 Minecraft Java 版启动器，中文界面、免费开源。",
        "<b>怎么装</b>：从 GitHub 发布页下载最新版，单文件直接运行；用它启动 Minecraft Java 版。",
        "<b>提醒</b>：PCL 这类启动器支持离线登录，<b>不一定需要买正版</b>（条件允许的话支持正版更好）；首次配置门槛较高，<b>B 站搜「PCL2 教程」</b>跟着做。"
      ] },
      { "name": "Wallpaper Engine", "icon": "🖼️", "url": "https://store.steampowered.com/app/431960", "desc": "Steam 动态壁纸引擎（付费，约 19 元）", "note": [
        "<b>是什么</b>：Steam 上的动态壁纸软件，创意工坊有海量玩家自制动态壁纸，桌面颜值神器。",
        "<b>怎么装</b>：Steam 商店购买下载（约 19 元，经常打折）。",
        "<b>提醒</b>：动态壁纸会轻微增加耗电，笔记本省电模式别开太华丽的。"
      ] }
    ]
  },
  {
    "cat": "🤖 AI 工具",
    "groupNote": "AI 很强，但先自己想，再让 AI 帮——别让它替你思考",
    "items": [
      { "name": "DeepSeek", "icon": "🐳", "url": "https://chat.deepseek.com", "desc": "国产 AI 对话，推理和代码都强", "note": [
        "<b>是什么</b>：深度求索的 AI 对话助手，推理能力和国产模型里数一数二，免费。",
        "<b>怎么用</b>：网页注册即用，也有手机 APP；深度思考模式适合难题。",
        "<b>开发者</b>：要接 API 见下一条的开放平台。"
      ] },
      { "name": "DeepSeek API 平台", "icon": "🔌", "url": "https://platform.deepseek.com", "desc": "开发者调用 DeepSeek 模型的开放平台", "note": [
        "<b>是什么</b>：DeepSeek 的 API 开放平台，写程序接 AI 能力用的（自动化、小工具、课程设计）。",
        "<b>怎么用</b>：注册账号 → 创建 API Key → 按 token 计费（价格便宜，学生小项目成本很低）。"
      ] },
      { "name": "Kimi", "icon": "🌙", "url": "https://www.kimi.com", "desc": "长文本阅读强，丢文档让它总结", "note": [
        "<b>是什么</b>：月之暗面的 AI 助手，长文本是特色——丢一份几十页的 PDF 让它总结、提问都行。",
        "<b>怎么用</b>：网页 / APP 注册即用，直接上传文件开始问。"
      ] },
      { "name": "豆包", "icon": "🥟", "url": "https://www.doubao.com", "desc": "字节 AI 助手，问答 + AI 生图", "note": [
        "<b>是什么</b>：字节的 AI 助手，日常问答、AI 生图、语音对话都行，APP 生态做得好。",
        "<b>怎么用</b>：网页 / 手机 APP 注册即用，免费。"
      ] },
      { "name": "通义千问", "icon": "☁️", "url": "https://www.tongyi.com", "desc": "阿里 AI 助手", "note": [
        "<b>是什么</b>：阿里的 AI 助手，问答、写作、编码都有，和阿里系工具链配合好。",
        "<b>怎么用</b>：网页 / APP 注册即用，免费。"
      ] },
      { "name": "智谱清言", "icon": "🧠", "url": "https://chatglm.cn", "desc": "智谱 AI 对话（GLM 系列）", "note": [
        "<b>是什么</b>：智谱的 AI 对话助手（GLM 系列模型），国产第一梯队，免费。",
        "<b>怎么用</b>：网页 / APP 注册即用。"
      ] },
      { "name": "ZCode", "icon": "🤖", "url": "https://zcode.z.ai/cn", "desc": "智谱的 AI 编程 Agent", "note": [
        "<b>是什么</b>：智谱的 AI 编程 Agent，能读懂项目、写代码、改 bug、跑命令。",
        "<b>💡 站长使用</b>：我目前代码开发主要用的就是它，这个网站的好多功能也是和它一起做的。",
        "<b>提醒</b>：AI Agent 上手需要一点学习成本，建议从让它解释代码开始。"
      ] },
      { "name": "WorkBuddy", "icon": "🤝", "url": "https://copilot.tencent.com", "desc": "腾讯 AI 办公 Agent，一句话让 AI 替你干活", "note": [
        "<b>是什么</b>：腾讯出的 AI 办公智能体——Excel、PPT、文件整理，一句话交给它，支持多个 Agent 并行干活。",
        "<b>怎么装</b>：官网（copilot.tencent.com）或腾讯软件中心下载桌面版。",
        "<b>💡 站长使用</b>：办公场景比较推荐这个——<b>想下载的话记得找我要邀请码</b>，用邀请码注册我也能攒点免费积分。"
      ] },
      { "name": "Qoder", "icon": "🅠", "url": "https://qoder.com", "desc": "阿里的 AI 编程 IDE", "note": [
        "<b>是什么</b>：阿里出的 AI 编程 IDE，主打 Agentic Coding（让 AI 接手整个开发任务）。",
        "<b>怎么用</b>：官网下载 IDE，登录阿里 / 渠道账号使用，有免费额度。",
        "<b>提醒</b>：和 ZCode / CodeBuddy 定位类似，选一个顺手的深入用就行。"
      ] },
      { "name": "OpenCode", "icon": "🗂️", "url": "https://opencode.ai", "desc": "开源 AI 编程 Agent（终端向）", "note": [
        "<b>是什么</b>：开源的终端 AI 编程 Agent，可以接各种模型 API，自由度最高。",
        "<b>怎么用</b>：需要自己配置模型 API Key，有一定门槛；开源免费。",
        "<b>提醒</b>：部分模型需要自行解决网络访问条件。"
      ] },
      { "name": "Codex", "icon": "🧾", "url": "https://openai.com/codex/", "desc": "OpenAI 的编程 Agent", "note": [
        "<b>是什么</b>：OpenAI 的 AI 编程 Agent，能力很强。",
        "<b>提醒</b>：需要 OpenAI 账号且<b>国内直连不稳定，需自行解决网络访问</b>；按用量计费。"
      ] },
      { "name": "CC Switch", "icon": "🔀", "url": "https://github.com/farion1231/cc-switch", "desc": "一键切换 AI 编程 CLI 的配置", "note": [
        "<b>是什么</b>：开源小工具，管理和一键切换 Claude Code / Codex 等 AI 编程 CLI 的 API 供应商配置。",
        "<b>怎么用</b>：从 GitHub Releases 下载安装，把不同供应商的配置存进去，点一下就切换。",
        "<b>提醒</b>：玩 AI 编程 CLI 的人才用得上，新手可以先跳过。"
      ] }
    ]
  }
];

// ===== 场景套装：按学生场景打包推荐（items 对应条目 name，点击可跳转定位） =====
const SCENES = [
  { "icon": "🎒", "name": "新生装机四件套", "desc": "报到第一晚就该装好",
    "items": ["火绒安全", "7-Zip", "Everything", "Snipaste"] },
  { "icon": "💻", "name": "开发 / 比赛套装", "desc": "写代码、打比赛、连服务器",
    "items": ["VS Code", "Python", "Git", "MobaXterm", "图吧工具箱"] },
  { "icon": "📝", "name": "写论文套装", "desc": "查文献、写文档、协作",
    "items": ["知网 CNKI", "WPS Office", "飞书"] },
  { "icon": "🎮", "name": "游戏娱乐套装", "desc": "劳逸结合，别沉迷",
    "items": ["Steam", "Watt Toolkit（原 Steam++）", "UU 加速器"] }
];

// ===== 「别用 ❌ → 改用 ✅」替代对照 =====
const SWAP_LIST = [
  { "bad": "360 / 电脑管家全家桶", "good": "火绒安全", "why": "安全软件装一个就够，全家桶只会拖慢电脑" },
  { "bad": "第三方下载站", "good": "官网直链", "why": "下载站是捆绑软件重灾区，高速下载器全是坑" },
  { "bad": "Windows 自带搜索", "good": "Everything", "why": "速度差着量级，输了名字秒出结果" },
  { "bad": "系统自带卸载", "good": "Geek Uninstaller", "why": "残留和注册表一次性清干净" }
];
