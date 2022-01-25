# 形態要素解析について

形態要素解析とは、自然言語処理の基本的技術の一つです。
簡単に言えば「自然言語で書かれた文章を、単語ごとに分割し、それぞれの品詞を判別する作業」の事です。

扱う言語が英語であれば、文章の中に単語と単語がスペースで明確に区切られているので、文章を単語に分けるのは用意です。

これに対して日本語は、単語ごとに分割する作業は骨の折れる作業となちます。
そこで、形態要素解析と言う作業が必要になります。

プログラムで、形態要素解析を行うのに、有名なのは以下のような、形態解析エンジンがあります。

> **MeCab** 
> https://taku910.github.io/mecab/

> **ChaSen** 
> https://chasen-legacy.osdn.jp/

> **KyTea** 
> http://www.phontron.com/kytea/index-ja.html

> **kuromoji** 
> https://www.atilika.com/ja/kuromoji/

> **Igo** 
> https://igo.osdn.jp/


ここでは、**MeCab** を利用して形態要素解析を行うので、MeCab サイトからダウンロードしてインストールを行ってください。

## Node.js から MeCab を使う方法

Node.js から MeCab を利用するにあたって、文字コードがShift_JISである為、Unicodeが基本となるNode.js で利用するには文字コードを Shift_JIS から UTF-8 に変換する必要があるので `iconv-lite` モジュールを利用して変換します。

`iconv-lite` のインストールは以下のコマンドでインストールします。
```bash
npm i iconv-lite
```
簡単なプログラムを書いて、その実行方法を確認していきましょう。 `mecab.js` と言う名前のファイルを作成して以下の様に記述してみます。
```javascript
var execFile = require('child_process').execFile;
var iconv = require('iconv-lite');
var fs = require('fs');
var platform = require('os').platform(); // OS判定

// 形態素解析するテキスト
var srcText = "探しつづけなさい。そうすれば見いだせます。\n";

// 一時ファイル
var TMP_FILE = '__mecab_tmpfile';
// MeCabのコマンドライン
var MECAB = 'mecab';
var ENCODING = (platform.substr(0, 3) == 'win')
	? 'SHIFT_JIS' : 'UTF-8';

// 形態素解析を実行する関数
function parse(text, callback) {
	// 変換元テキストを一時ファイルに保存
	if (ENCODING != 'UTF-8') {
		var buf = iconv.encode(text, ENCODING);
		fs.writeFileSync(TMP_FILE, buf, "binary");
	} else {
		fs.writeFileSync(TMP_FILE, text, "UTF-8");
	}
	// コマンドを実行
	var opt = { encoding: 'UTF-8' };
	if (ENCODING != 'UTF-8') opt.encoding = 'binary';

	execFile(MECAB, [TMP_FILE], opt,
		function (err, stdout, stderr) {
			if (err) return callback(err);
			var inp;
			// 結果出力ファイルを元に戻す
			if (ENCODING != 'UTF-8') {
				iconv.skipDecodeWarning = true;
				inp = iconv.decode(stdout, ENCODING);
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
}

// 形態素解析を実行する
parse(srcText, function (err, result) {
	for (var i in result) {
		var word = result[i][0];
		var hinsi = result[i][1];
		var yomi = result[i][8];
		if (word == "EOS") continue;
		console.log(word + ":" + hinsi + ":" + yomi);
	}
});
```
実行するには、以下のコマンドを実行します。
```bash
node mecab.js
```
```bash
探し:動詞:サガシ
つづけ:動詞:ツヅケ
なさい:動詞:ナサイ
。:記号:。
そう:副詞:ソウ
すれ:動詞:スレ
ば:助詞:バ
見いだせ:動詞:ミイダセ
ます:助動詞:マス
。:記号:。
```
無事に、MeCabから結果が返されたなら、データをタブやカンマで区切って、二次元配列にして返します。
### MeCab 利用状の注意点
意外な盲点として、MeCab では改行を文章の最後とみなすのですが、そのため、末尾に改行が無い文字列を与えると「**input-buffer overflow**」というエラーが出てしまいます。
この点に注意が必要です。

## プログラムを整理して形態解析モジュールを作ろう
Node.Jsでモジュールを作るには、`module.exports`オブジェクトに追加したいメソッドを記述するだけです。

### MeCab モジュールを作成
MeCabのモジュールとして`mecab-mod.js`と言う名前のファイルを作成し以下の様に記述してみます。
```javascript
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
```
MeCabを実行するプログラムとして`mecab-mod-test`と言う名前のファイルを作成し以下の様に記述してみます。
```javascript
var Mecab = require('./mecab-mod.js');
var mecab = new Mecab();

var text = "すもももももももものうち";
mecab.parse(text, function (err, items) {
	for (var i in items) {
		var k = items[i];
		if (k == "EOS") continue;
		console.log(k[0] + ":" + k[1]);
	}
});
```

実行するには、以下のコマンドを実行します。
```bash
node mecab-mod-test.js
```
```bash
すもも:名詞
も:助詞
もも:名詞
も:助詞
もも:名詞
の:助詞
うち:名詞
```

## 文章にフリガナを振るプログラム

それでは、前項で作成したMeCab のモジュールを利用いて、文章にフリガナを振るプログラムを`furigana.js`として作成していきます。

```javascript
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
```
文章を記述したテキストファイル`text.txt`を用意します。
```txt
吾輩は猫である。名前はまだ無い。
どこで生れたかとんと見当がつかぬ。
何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。
吾輩はここで始めて人間というものを見た。
```
実行するには、以下のコマンドを実行します。
```bash
node furigana.js text.txt
```
> 吾輩(ワガハイ)は猫(ネコ)である。名前(ナマエ)はまだ無い(ナイ)。どこで生れ(ウマレ)たかとんと見当(ケントウ)がつかぬ。何(ナニ)でも薄暗い(ウスグライ)じめじめした所(トコロ)でニャーニャー泣い(ナイ)ていた事(イタコト)だけは記憶(キオク)している。吾輩(ワガハイ)はここで始め(ハジメ)て人間(ニンゲン)というものを見(ミ)た。