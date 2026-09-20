# 接手 FailFold：完整實作的發布候選版

請直接接手並驗收這個資料夾內已有的程式，完成必要修正與可授權的發布工作；不要只回覆計畫，不要重做成大型架構。只讀取此專案。不得讀取、修改或借用使用者其他專案、文件、舊工作內容，也不要改動 GlobGap。

## 目標與既有狀態

FailFold：本機讀取多份 JUnit XML，合併相同失敗特徵、比對提供的基準、保留每筆來源與原始失敗內容。單檔網頁與 Node CLI 共用引擎。已有原始碼、合成示範、測試、截圖、文件及 MIT 授權。

請先完整讀 README.md、SECURITY.md、docs/VERIFICATION.md、docs/COMPATIBILITY.md、docs/APPLICATION_DRAFT.md，以及本文件，再讀 src、web、scripts、tests。

本次交付的本機驗證是 68 項 Node 測試與 17 項 Chromium 驗收。測試數可能因修正增加，但只能回報實際結果。瀏覽器驗收用 in-memory HTML，不能冒充雙擊檔案、localhost 或正式網站已驗證。Windows、GitHub Actions、Pages、公開 Release 皆尚未實際驗證或發布。請補齊，不要繼承不存在的成功狀態。

## 不可變更的產品邊界

不加入登入、訂閱、遙測、上傳、雲端儲存、AI 推論、API key、MCP、資料庫、大型前端框架或自動抓使用者 CI 資料。保持單一用途。

不得將「相同特徵」稱為「相同根本原因」。不得把「未觀察到」稱為「已修好」，也不能說「seen」代表該測試沒有新退步。空白訊息與 trace 不得硬合併。不可為了好看的壓縮率移除數字、路徑、狀態碼或堆疊位置。formatting 必須選擇性啟用且保留原始變體。

每筆 failure/error 原文（經 XML 解碼）和來源仍須在匯出中存在。不可執行報告內容或把它插入 innerHTML。不能把不支援的 retry 擴充默默判定 pass。輸出可含機密，不能宣稱自動去識別化。68 個測試不是安全認證。

## 本機接手與補驗

1. 確認工作目錄確實是新專案 FailFold；有既有變更先保留，不要刪除使用者檔案。記錄 Node、Python、OS、瀏覽器版本。
2. 在 Windows 使用 `npm.cmd test`、`npm.cmd run build`，執行合成示範 CLI 與 Markdown/JSON 匯出。驗證中文空白路徑、檔案別名、覆寫保護及退出碼。不需下載 npm 套件。
3. 瀏覽器開發測試：`python -m pip install -r requirements-dev.txt`，`python -m playwright install chromium`，`npm.cmd run test:browser`。正常環境不要設 FAILFOLD_IN_MEMORY_TEST。需要系統 Chromium 時才設 PLAYWRIGHT_CHROMIUM_EXECUTABLE。
4. 實際雙擊 dist/index.html 驗證 Blob Worker、檔案選擇及下載。若瀏覽器政策不允許，記錄限制，改以 README 的 loopback 方式測試，不得關閉管理政策或假裝 file URL 成功。
5. 真正測試正常 HTTP 導覽、載入後離線、手機390px、無水平溢出、malformed XML、DTD、未知資料、取消分析、搜尋、基準清除，以及瀏覽器/Node匯出一致。
6. 檢查原始碼與限制，發現 bug 先加回歸測試再修正。必要修正不可順手擴張產品。特別確認來源對照、巢狀 summary、空白 error、重複報告與不支援的 exporter。
7. vendor/xmldom 是隨附的未修改 0.9.8 套件。請連網核對官方來源、npm tarball integrity、已知安全公告及是否需升級；單純 npm audit 顯示沒有 top-level dependencies 不是安全證據。保留MIT notice，更新 docs/vendor-sha256.json，重新跑全部測試與建置。無法完成須列待辦，不要捏造審查。
8. 確認兩次相同來源建置 dist/index.html 的 SHA-256 一致。`npm.cmd run benchmark` 得到你自己的環境結果，標明 synthetic 與算法範圍，不得換算成人類省時率。
9. 將各項實際結果寫入新的驗證紀錄，保留交付時紀錄。檢查無秘密、使用者私人文件、tokens、絕對本機家目錄、額外二進位或字型檔。

## GitHub 權限與發布界線

使用者正確 GitHub 帳號為 **billy30183-rgb**，不是 billy30183。這份文件不授權你公開推送新專案，也不授權用上次另一個專案的同意代替這次同意。

本機驗收可直接繼續；公開寫入前，除非使用者已在本次 Codex 對話明確指定並授權此目的地，否則請集中詢問一次：是否同意在 `billy30183-rgb/failfold` 建立公開倉庫、推送這份專案、啟用 Pages 並發布 v0.1.0？不要因為有 gh 登入就自行發布。

獲授權後才執行：

- 用 `gh api user --jq .login` 實際確認登入帳號。若不一致，停止寫入並協助正確登入；不得複製舊裝置代碼或把權杖寫進文件。
- 只檢查指定新倉庫名稱。若同名倉庫已存在，先讀其基本 metadata，停止並確認，不得 force push、刪除、覆寫或把它當成本專案。
- 新建公開倉庫前也檢查名稱衝突；沒有完整商標或套件名稱 clearance，不能宣称名稱全球唯一。保持 npm package private:true；這次不需 npm 發布。
- 以真實提交歷史發布，不回填日期、不拆造虛假維護史、不冒用 commit 作者。MIT license 與第三方 notices 必須保留。
- 檢查 .github/workflows/ci.yml 上游 Actions 版本、runner 相容性及最小權限；可核對後固定真實完整 commit SHA，不能憑記憶捏造 hash。現有 CI 是未在遠端跑過的模板。
- 建置與PR測試只需要 contents:read。不要用 pull_request_target 執行不可信程式，不授權 secrets。不用使用者私人報告測公開 CI。
- Pages 只部署 dist 靜態站。先核對 GitHub 官方當前 Pages action 用法，另建只在授權 main 分支執行的最小權限部署工作；pages:write 與 id-token:write 限該部署job。不對PR開放部署。

## 正式站驗收與 release

等待同一確切 commit 的遠端 Node/Windows/Chromium/build/Pages 皆通過，記錄真實 job URL。失敗就修正重測，不靠跳過測試或改假結果。

以環境變數 `LIVE_URL` 指向已驗證的正式站，執行 `npm.cmd run test:browser`；不得啟用 FAILFOLD_IN_MEMORY_TEST。此測試必須實際從正式 URL 導覽，再離線完成整套驗收。若重新導向導致「外部要求」檢查失敗，先核對 canonical URL，不能廣泛放寬網路白名單。另比對线上 index.html、LICENSE.txt 的 SHA-256 與本地 dist。

實際檢視正式站桌機與手機截圖，不得生成假畫面。確認README的線上連結能用後再補公開連結與真實狀態；再對最終文件版本跑CI／部署。公開tag、release與正式部署必須一致對應同一確切commit。

不要覆寫既有tag或release。新 v0.1.0 必須在所有必要驗收成功後才建立；版本衝突先確認。未完成時清楚列出阻礙與已完成部分，不宣稱已上架。

最後交付來源、正式站、release、CI、部署的真實URL；確切commit與hash；實際測試數、環境與限制；本地來源ZIP與靜態站ZIP。對尚未核實內容明確註記。

## 申請與推廣

使用者希望透過有用的開源工具申請 Codex for Open Source，但不存在你能保證的錄取。先核對官方當前資格。這次不代填、不代送、不登入申請表，不公開發HN/Reddit/其他專案issue，也不刷star。

docs/APPLICATION_DRAFT.md 與 docs/LAUNCH_DRAFT.md 只是草稿。以真實維護身分、持續修正及使用證據補強。沒有使用量就如實寫 early-stage。不要把合成 240→3 寫成真實省時98.8%、不要編造大公司使用、不要承諾「保證20X」或某錄取率。核心產品不需API，不得為勾選API credits捏造需求。

完成一個有真實使用、維護與可核驗效果的小工具，比再製造一批空泛專案更符合此次目的。只承諾你已實際驗證的結果。
