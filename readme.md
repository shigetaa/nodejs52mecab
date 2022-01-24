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



## プログラムを整理して形態解析モジュールを作ろう

## 文章にフリガナを振るプログラム
