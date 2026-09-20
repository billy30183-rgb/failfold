# FailFold：繁體中文快速開始

FailFold 已公開部署：[直接試用](https://billy30183-rgb.github.io/failfold/) · [原始碼](https://github.com/billy30183-rgb/failfold)。

## 先看效果

解壓縮後，以瀏覽器開啟 `dist/index.html`，按 **Try the 240 → 3 demo**。程式不需帳號、API 金鑰或伺服器推論。介面採英文，方便後續開源。

若瀏覽器不允許直接開啟本機 HTML，在此專案資料夾執行：

```text
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

再開啟 `http://127.0.0.1:8000/`。只提供 `dist` 靜態檔案；XML 由瀏覽器自行讀取，不會上傳給這個伺服器。Windows 上已用 Playwright 1.57 驅動 Microsoft Edge 153，完成 17 項 HTTP 瀏覽器驗收。另以實際 file URL 導覽通過同樣 17 項驗收（並非真人雙擊操作）；正式網址也已通過 17 項驗收；詳見 [Windows 驗證紀錄](docs/WINDOWS-VERIFICATION.md)。

內建示範是刻意製作的合成資料：240 筆失敗收斂成 3 組相同特徵，其中 1 組相較提供的基準新增。這不是 3 個已證明的根本原因，也不是實測省時 98.8%。

## 真正要解決的工作

把多份 CI（自動化測試）產生的 JUnit XML，整理成「先看哪些不同錯誤」的清單。每組仍能查看來源報告、測試名稱、類別、位置及每筆失敗原文。新增基準報告後，區分已見過與未見過的特徵。基準中有、這次沒有的，只標成「未觀察到」，不說已修復。

選好目前報告或基準報告後，程式會自動重新分析；介面沒有另外的 **Analyze reports** 按鈕。切換比對或分組選項時也會自動更新。

這個版本不是讀任意錯誤日誌，也不會連到 GitHub 幫你抓報告。它接收 JUnit XML；不支援的重試擴充會明確拒絕。錯誤都不同時，合併效益可能很小。

## 命令列與測試

先安裝 Node.js 22 或更新版。已附 `@xmldom/xmldom` 0.9.12 XML 解析器，不需要額外下載 npm 套件。

```text
node src/cli.js examples/current --baseline examples/baseline --output report.md --json report.json
npm.cmd test
npm.cmd run build
```

Windows 的 PowerShell 遇到 `npm.ps1` 執行政策限制時，可用 `npm.cmd`。瀏覽器測試另需 Python 與 Playwright；參見 README。

目前 Windows 驗證已通過 73 項 Node 測試，以及上述 17 項 HTTP 瀏覽器驗收。Windows/Linux 與 Chromium 遠端 CI 已通過，Pages 已部署；實際本機檔案網址導覽亦已通過 17 項驗收。

匯出的報告可能包含秘密或個資，分享前務必檢查。程式不做自動遮罩，不應把「本機處理」誤當「輸出的檔案適合公開」。

## 交給 Codex 上架

在 Codex 只選擇這個新解壓縮的專案資料夾，貼上：

```text
請先完整閱讀 CODEX_HANDOFF.zh-TW.md、README.md、docs/VERIFICATION.md、docs/WINDOWS-VERIFICATION.md，接手現有 FailFold，不要重做或擴充架構。先完成文件列出的 Windows、正常瀏覽器導覽、依賴檢查及測試；不要把尚未跑過的測試寫成通過。我的 GitHub 帳號是 billy30183-rgb。請勿讀取或修改其他專案。公開建立新倉庫前先取得我對 billy30183-rgb/failfold 的同意。
```

`CODEX_HANDOFF.zh-TW.md` 已寫好完整驗收及發布流程。`docs/APPLICATION_DRAFT.md` 是誠實申請草稿：尚無真實採用數據，不保證任何審核結果。先完成公開部署與維護，再用真實使用及修正紀錄補強申請；不要增加空洞專案數量或捏造星星。
