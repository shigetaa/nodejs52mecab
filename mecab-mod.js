// MeCabを利用するためのモジュール
module.exports = function () {
	// 外部モジュールの取り込み
	var execFile = require('child_process').execFile;
	var iconv = require('iconv-lite');
	var fs = require('fs');
	var platform = require('os').platform();

	// モジュール変数の定義
	// 一時ファイル
	this.TMP_FILE = '__mecab_tmpfile';
	// MeCabのコマンドライン
	this.MECAB = 'mecab';
	this.ENCODING = (platform.substr(0, 3) == 'win')
		? 'SHIFT_JIS' : 'UTF-8';

	// 形態素解析を実行する関数
	this.parse = function (text, callback) {
		var encoding = this.ENCODING;
		text += "\n";
		// 変換元テキストを一時ファイルに保存
		if (encoding != 'UTF-8') {
			var buf = iconv.encode(text, encoding);
			fs.writeFileSync(this.TMP_FILE, buf, "binary");
		} else {
			fs.writeFileSync(this.TMP_FILE, text, "UTF-8");
		}
		// コマンドを実行
		this.opt = { encoding: 'UTF-8' };
		if (encoding != 'UTF-8') this.opt.encoding = 'binary';
		execFile(this.MECAB, [this.TMP_FILE], this.opt,
			function (err, stdout, stderr) {
				if (err) return callback(err);
				var inp;
				// 結果出力ファイルを元に戻す
				if (encoding != 'UTF-8') {
					iconv.skipDecodeWarning = true;
					inp = iconv.decode(stdout, encoding);
				} else {
					inp = stdout;
				}
				// 結果をパースする
				inp = inp.replace(/\r/g, "");
				inp = inp.replace(/\s+$/, "");
				var lines = inp.split("\n");
				var res = lines.map(function (line) {
					return line.replace('\t', ',').split(',');
				});
				callback(err, res);
			});
	};
};
