var fs = require('fs');
var Mecab = require('./mecab-mod.js');
var mecab = new Mecab();

// コマンドラインを調べる
var args = process.argv;
args.shift(); // node を除去
args.shift(); // スクリプト名を除去

// 引数がなければプログラムの使い方を表示する
if (args.length <= 0) {
	console.log("[USAGE] furigana.js 入力テキスト");
	process.exit();
}

// 入力ファイルを読み込む 
var inputfile = args.shift();
var txt = fs.readFileSync(inputfile, "utf-8");

// 形態素解析する
mecab.parse(txt, function (err, items) {
	var res = "";
	for (var i in items) {
		var k = items[i];
		var word = k[0];
		var kana = k[8];
		if (k == "EOS") continue;
		// フリガナが必要なときを判定 
		if (word == kana || isHiragana(word) || kana == undefined) {
			res += word;
		} else {
			res += word + '(' + kana + ')';
		}
	}
	console.log(res);
});

// ひらがな判定
function isHiragana(s) {
	return (s.match(/^[あ-ん]+$/));
}
