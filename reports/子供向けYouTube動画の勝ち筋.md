# コードで描く「待つ知育」で日本の隙間を取る

日本の個人クリエイターがコード生成アニメーションで勝負するなら、推奨は **2〜5歳向けの低刺激クイズ知育シリーズ(問いかけ→無音の「待ち」→答え、という構造を持つオリジナルキャラクター番組)を、家事中のテレビ視聴に合わせた20〜30分のまとめと組み合わせる案**である。理由は三つある。第一に、幼児向けの上位は海外・国内とも法人運営が独占しており、量で勝つ道は閉じている。参考になるのは約91本で約32億回のHey Bear Sensoryや126本で約5億回の東京ハイジのような少本数・高品質型である。第二に、2025年7月以降のYouTubeはAIそのものではなく「テンプレート量産」を収益化停止・チャンネル削除の対象にしており、2026年にはAIキッズチャンネルが実際に処分された。第三に、子ども向け(made for kids)の広告単価は全ジャンル最低水準(ある調査で中央値RPM約0.33ドル)で、広告だけでは事業にならない。コード描画は「文字や数が崩れない」「間の長さを秒単位で設計できる」という、生成動画AIにはない強みを持ち、これは研究で裏付けのある設計(繰り返し、問いかけと待ち、少ないカット)とそのまま重なる。ただし、個人のコード生成キッズチャンネルが2023〜2026年に急成長した検証可能な事例は一件も見つかっておらず、この提案は実績の模倣ではなく調査結果からの推論である。

> **本レポートの数字の扱いについて。** 元になった調査ノートは、調査時(2026年11月20日)にページ本文を直接取得できず、**すべて検索結果の要約・抜粋に基づいている**。登録者数・再生数・単価・ポリシーの文言はいずれも未検証で、取得時点もサイトごとに異なる。引用前に原ページ(YouTubeヘルプ、Social Blade、ユーチュラ等)で再確認が必要である。本文中で「推測」と書いた箇所は、出典のあるデータではなく調査者または本レポートの推論である。

## 上位は法人が独占し、個人の手本は「少本数で何度も見られる」型にある

世界の顔出しなし幼児向けは、童謡ブランドの寡占である。検索抜粋ベースでは **Cocomelonが登録者約2.03億人・累計約2,300億回**、ChuChu TVが約9,800万人、Pinkfongが約8,500万人、Super Simple Songsが約4,700万人、2022年開始のBebefinnが約3,700万人と並ぶ ([vidIQ](https://vidiq.com/youtube-stats/top/100/), [Social Blade](https://socialblade.com/youtube/handle/bebefinn))。いずれも数千本の動画と多言語チャンネルを持つスタジオで、個人が同じ土俵に立つ余地はない。しかもこの層ですら安定していない。Cocomelonの週間再生は2025年12月の約21.4億回から2026年4月の約3.6億回まで動いたと報じられ、所有会社のトップ自身がアルゴリズムの調整で月間再生が120億回から90億回に変わると語っている ([Tubefilter](https://www.tubefilter.com/2026/04/27/top-50-most-viewed-youtube-channels-week-of-04-26-2026/), [Deadline](https://deadline.com/2025/09/cocomelon-kevin-mayer-youtube-1236544591/))。

個人に近い規模で最も参考になるのは **Hey Bear Sensory** である。登録者約390万人、**約91本で累計約32億回**、単純計算で1本あたり約3,500万回になる(1本あたりは調査者の計算) ([OutlierKit](https://outlierkit.com/channel/heybear))。踊る果物のキャラクターと音楽だけで言葉がなく、明るい「ダンスパーティー」と暗く遅い寝かしつけ用の二系統を持つ ([Romper](https://www.romper.com/parenting/hey-bear-sensory-youtube-dancing-veggie-videos))。ただしこれは手軽さの証明ではない。同チャンネルは2019年に10万人、2022年に100万人と時間をかけて伸び、**1本に4〜5か月をかけるチーム制作**と報じられている ([The Licensing Letter](https://thelicensingletter.com/?p=36286), [Romper](https://www.romper.com/parenting/hey-bear-sensory-youtube-dancing-veggie-videos))。

日本語市場も構図は同じで、天井が一段低い。

| チャンネル | 運営 | 登録者(約) | 累計再生(約) | 形式 |
|---|---|---|---|---|
| BabyBus(日本語) | 中国スタジオ | 583万人 | 78億回 | 3D、童謡+生活習慣 |
| Pinkfong(日本語) | 韓国スタジオ | 365万人 | 33億回 | 童謡、Baby Shark |
| サンサンキッズTV | 株式会社aquwa | 228万人 | 37億回 | オリジナルキャラ、3〜6歳(純アニメかは未確認) |
| シナぷしゅch | テレビ東京 | 89万人 | 11.5億回 | 0〜2歳向け番組公式 |
| うたスタ | 不明 | 73万人 | 10.6億回 | 童謡・番組曲のアニメ付きカバー |
| 東京ハイジ | 姉妹ユニット | (2022年時点35万人) | 5.2億回(126本) | 手描き風、生活習慣のオリジナル曲 |
| ソポアートパーク | 個人系プロジェクト | 8.5万人 | 6,200万回 | 0〜3歳向けアート系知育 |

出典は [userlocal](https://youtube-ranking.userlocal.jp/user/443BE6BAF637565E_bef46c)、[デジタルクリエイターズ](https://digitalcreators.jp/channel/ja/UCXt0PoqhaglDKov1JbIPFEg/)、[ユーチュラ(サンサン)](https://yutura.net/channel/264/)、[ユーチュラ(シナぷしゅ)](https://yutura.net/channel/55977/chart/)、[vidIQ(うたスタ)](https://vidiq.com/youtube-stats/channel/UCuICbqzz8-SvKK8kAe_IwdQ)、[ユーチュラ(東京ハイジ)](https://yutura.net/channel/331/)、[東京ハイジ公式](https://tokioheidi.com/about/)、[lit.link(ソポ)](https://lit.link/en/sopoartpark)。数値は時点がばらばらで相互比較には向かない。なお講談社のボンボンアカデミー(約128万人)は出演者が顔出しする実写中心で、今回の条件には当たらない ([公式](https://bom-bom-academy.com/about.html))。

この表から読み取れることは二つある。一つは、**登録者50万人以上で個人運営の顔出しなしアニメは確認できなかった**こと(調査範囲内での結論)。もう一つは、日本でも勝ち方が二極化していることである。BabyBusやPinkfongは大量の翻訳コンテンツで押し、東京ハイジは126本で約5億回、1本平均約410万回(調査者計算)、「はみがきのうた」1本が2022年時点で9,200万回超という少本数型で成立している ([東京ハイジ公式](https://tokioheidi.com/about/))。個人が取れるのは後者、あるいはソポアートパークや白黒赤のオノマトペ動画を出すピカブーきっずchのような月齢特化ニッチである ([ユーチュラ](https://yutura.net/channel/136502/popular/GMP_kO7haeo/))。ソポアートパークが広告ではなく支援レター・LINEスタンプ・グッズ・CAMPFIREコミュニティで運営を支えている点は、後述する単価の低さと符合する ([CAMPFIRE](https://community.camp-fire.jp/projects/view/769989))。

## 伸びるのは0〜2歳と「落ち着いた」動画、童謡3D・色数字・のりものは埋まっている

ジャンル別の成長率を測った信頼できるデータは、海外・日本とも見つからなかった。したがって以下の伸び・飽和の区分は、周辺データからの**推測**である。

需要側で最もはっきりしているのは低年齢化である。米Pewの調査では、2歳未満の子がYouTubeを見ると答えた親が**2020年の45%から2025年には62%**に増え、毎日見る割合も24%から35%になった ([Pew Research](https://www.pewresearch.org/internet/2025/10/08/how-parents-describe-their-kids-tech-use/))。日本でもNHK放送文化研究所の2025年調査で未就学児のネット動画週間接触が66%、0歳でも約半数に達し、ビデオリサーチの調査では動画視聴が好きな割合が0歳21.6%、1歳43.3%、2歳64.4%と年齢とともに急伸する ([J-STAGE](https://www.jstage.jst.go.jp/article/bunken/76/3/76_2/_pdf/-char/ja), [VR Digest plus](https://www.videor.co.jp/digestplus/article/consumer250319.html))。そして2歳未満の視聴では、親の95%が少なくとも時々一緒に見ている ([Pew Research](https://www.pewresearch.org/internet/2025/10/08/how-parents-manage-screen-time-for-kids/))。つまりこの年齢帯では動画を選ぶのは親であり、親が安心できるかどうかが選択を決める(後半は推測)。

その親の側で起きているのが「スローTV」「低刺激」志向である。米国の主要メディアが相次いで取り上げ、穏やかな自然・マインドフルネス系のYouTube発シリーズも登場している ([Good Morning America](https://www.goodmorningamerica.com/family/story/slow-tv-movement-118533593), [C21Media](https://www.c21media.net/department/kids-classics/pit-pats-offers-slow-tv-for-wound-up-kids/))。ただし数字の裏付けは弱い。関連ハッシュタグの視聴が約10万回という報告もあり、大衆的な転換というより、親が選ぶコンテンツでの差別化要素と見るのが妥当である ([Movieguide](https://www.movieguide.org/news-articles/heres-why-parents-are-embracing-the-slow-tv-movement.html))。日本の親について同じ志向を測った調査は今回見つかっていない。

日本固有の需要は視聴場面に表れる。動画を見せる場面は**「家事の最中」が約7割**(aquwa調査71.5%、アカチャンホンポ調査も約7割。いずれも自社会員対象で代表性は低い)、2〜6歳がネット動画を見る機器は**テレビが68%で最多**、ボンボンアカデミーでも視聴者の3分の2がテレビで、親には長尺が好まれるという ([nippon.com](https://www.nippon.com/ja/japan-data/h01169/), [アカチャンホンポ](https://www.akachan.jp/topics/clife/2307/), [J-STAGE](https://www.jstage.jst.go.jp/article/bunken/75/7/75_22/_article/-char/ja), [Yahoo! JAPAN](https://article.yahoo.co.jp/detail/89b07845b91ac227c0043a57d6664fbbbc73ea1c))。需要の核は「手が離せない10〜30分を安心して任せられる、テレビ画面向けの長尺」だと推測できる。一方で、やめさせると大泣きする、毎日見せてよいのかという葛藤も育児メディアで繰り返し取り上げられている ([HugKum](https://hugkum.sho.jp/686573))。

単体で1億回級に届いた日本の動画は、色の知育(BabyBus「いろボール」ショート約10.5億回)、手遊び歌(「ひげじいさん」1億回超)、生活習慣(「はみがきのうた」)に集中している ([ユーチュラ](https://en.yutura.net/ranking/record_video/), [コクリコ](https://cocreco.kodansha.co.jp/cocreco/general/childcare/6LBzR))。誰もが知る定番で、かつ毎日の場面で親が繰り返し再生する実用性があるものが強い、というのが調査者の読みである。

飽和側は、Cocomelon型の3D童謡、汎用的な「色・数字・ABCを覚えよう」、のりものソングである。4,000万〜2億人規模のスタジオが占め、そこにAI量産が流れ込んだ。米国では1日約50本、7か月で1万本超を上げたAIチャンネルが報じられ、報道後に停止された ([Mother Jones](https://www.motherjones.com/media/2026/03/this-is-your-kids-brain-on-ai-slop/))。日本ののりもの系も専門チャンネルが複数あり、「【20分】乗り物アニメまとめ・はたらくくるま＆新幹線【赤ちゃんが喜ぶ知育動画】」のようなほぼ同型のタイトルが並ぶ ([YouTube例](https://www.youtube.com/watch?v=44_wEopqyeI))。再生数の裏付けはないが、差別化しにくい領域と推測される。感覚・高コントラスト系も空白ではなく、海外には4年以上前からの専門チャンネルが複数ある ([Baby Sensory World](https://www.youtube.com/channel/UCuoWjnpCGqXapdTJQ9ZAnyw))。

ショートは発見の入口としては巨大だが、土台にはならない。2026年の週間再生上位はショート主体のチャンネルが占め、インドの子役チャンネルは週21.6億回を記録した翌月に1週間で67%を失った ([Tubefilter](https://www.tubefilter.com/2026/03/17/top-50-most-viewed-youtube-channels-week-of-03-15-2026/), [Tubefilter](https://www.tubefilter.com/2026/04/27/top-50-most-viewed-youtube-channels-week-of-04-26-2026/))。2026年1月からは保護者がショートの視聴時間に上限を設定できるようになったとも報じられている ([Wikipedia](https://en.wikipedia.org/wiki/YouTube_Shorts))。

## 罰せられるのはAIではなく量産であり、広告単価は全ジャンル最低である

### 2026年に実際の処分が始まった

YouTubeは2025年7月15日、収益化ポリシーの「繰り返しの多いコンテンツ」を「inauthentic content」と改称し、量産的・反復的なコンテンツを指すと明確化した。例として挙げられたのは、表面的な違いしかないナレーション動画や、同じナレーションのスライドショーである ([TechCrunch](https://techcrunch.com/2025/07/09/youtube-prepares-crackdown-on-mass-produced-and-repetitive-videos-as-concern-over-ai-slop-grows))。Google日本法人は生成AIを狙ったものではなく、求めるのは「オリジナル」で「本物」であることだと説明している ([ITmedia AI+](https://www.itmedia.co.jp/aiplus/articles/2507/10/news128.html))。報告されている許容例には「自分が考えたキャラクターと物語をAIで映像化する」ことが含まれる ([ytgrowth.io](https://ytgrowth.io/blog/youtube-ai-policy))。

執行は2026年に現実になった。1月には**登録者合計約3,500万人・累計約47億回のAIチャンネル16件**が削除または動画を消去され、YouTubeはスパムポリシー違反と説明した ([Tubefilter](https://tubefilter.com/2026/01/29/youtube-ai-slop-channel-crackdown-bans/))。2月にはニューヨーク・タイムズの調査を受け、幼児向けAI動画の5チャンネルがパートナープログラムから停止され、YouTube Kidsにも出られなくなった ([Digital Trends](https://www.digitaltrends.com/social-media/investigation-finds-youtube-is-serving-mindless-ai-slop-to-toddlers-and-preschoolers/), [Dexerto](https://www.dexerto.com/youtube/youtube-strikes-down-channels-after-investigation-into-bizarre-ai-content-for-kids-3326231/))。4月には200超の団体・専門家が、全AIコンテンツのラベル表示とYouTube KidsからのAI排除を求める公開書簡を出した ([Tubefilter](https://www.tubefilter.com/2026/04/01/youtube-fairplay-kids-ai-open-letter/))。6月には、正当な顔出しなしクリエイターまで巻き添えになっているとの報道もある ([The Next Web](https://thenextweb.com/news/youtube-ai-slop-crackdown-faceless-creators-collateral-damage))。書簡の要求をYouTubeが採用したかどうかは、2026年11月時点で確認できていない。

ここから導かれる含意は、コード生成アニメにとって厳しい(以下は推測)。処分の重さは二段階あり、収益化停止(inauthentic content)とチャンネル削除(スパム)がある。そして審査されるのは道具ではなく、カタログ全体の似通い方である。同じレイアウト・声・構成で色や数字だけを差し替えた動画群は、コードで作ったものほど「テンプレートで作られ、ほとんど違いがない」という定義に当てはまりやすい。

### 子ども向け固有の関門が三つ重なる

第一は品質原則である。子ども向けチャンネルには追加の収益化基準があり、低品質とされるのは、過度に商業的、否定的な行動の助長、**見せかけの教育(deceptively educational)**、**理解を妨げるもの**、扇情的・誤解を招くもの(タイトルやサムネイルを含む)である。低品質に強く偏ったチャンネルはパートナープログラムから停止され得る ([YouTubeヘルプ](https://support.google.com/youtube/answer/10774223?hl=en), [YouTube Blog](https://blog.youtube/inside-youtube/enabling-high-quality-youtube-kids-experience/))。

第二はYouTube Kidsである。made for kidsに設定してもKidsアプリには自動では入らず、掲載はYouTube側の自動フィルタと人の審査で決まる ([YouTubeヘルプ](https://support.google.com/youtube/answer/9684541))。さらにYouTubeは、Kidsアプリ内のAI生成コンテンツを「少数の高品質チャンネル」に限定していると述べている ([MediaPost](https://www.mediapost.com/publications/article/414000/google-pressured-to-stop-serving-ai-video-to-kids.html))。新規のAIアニメチャンネルは当面Kidsアプリに入れない前提で、本体アプリでの視聴を想定すべきである(推測)。

第三は視聴者設定の法的責任である。ディズニーは一部動画を子ども向けに設定しなかったとして1,000万ドルの民事制裁金に合意し、原因は動画ごとでなくチャンネル単位で設定していたことだとされた ([FTC](https://www.ftc.gov/business-guidance/blog/2025/09/protecting-children-watching-youtube-videos-lessons-learned-ftcs-settlement-disney))。設定は動画ごとに行う必要がある。

AI開示については、義務があるのは写実的に見える改変・合成コンテンツで、明らかに非現実的なアニメーションは対象外とされる。ラベル自体は推薦や収益に影響しないとYouTubeは説明しており、2026年5月からは未申告のAI動画の自動検出・自動ラベルも始まったと報じられている ([YouTubeヘルプ](https://support.google.com/youtube/answer/14328491?hl=en), [YouTube Blog](https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/))。コード描画の2Dは義務の対象外になる見込みだが、概要欄で制作方法を自主的に開示するほうが安全である(後半は推測)。

### 100万回で約5万円という単価が戦略を決める

made for kidsにすると、パーソナライズド広告、コメント、通知、メンバーシップ、Super Chat、カードと終了画面などが使えなくなる(現行の正確な一覧は公式ページで要確認) ([YouTubeヘルプ](https://support.google.com/youtube/answer/9632097?hl=en))。約300チャンネルを対象にしたある事業者の調査では、**Kids & Teensの長尺RPMは中央値0.33ドルで全ジャンル最低**、ショートは1,000回あたり0.05〜0.11ドルだった ([AIR Media-Tech](https://air.io/en/air-data-findings/youtube-monetization-statistics-2026), [AIR Media-Tech](https://air.io/en/air-data-findings/what-is-youtube-shorts-rpm-in-your-niche-in-2026))。日本の個人ブログの試算も100万再生あたり手取り約5万円としており ([ryomemoblog](https://ryomemoblog.com/%E3%80%90%E5%8F%8E%E7%9B%8A%E6%BF%80%E6%B8%9B%E3%81%AE%E7%9C%9F%E5%AE%9F%E3%80%91youtube%E3%80%8C%E5%AD%90%E4%BE%9B%E5%90%91%E3%81%91%E3%83%81%E3%83%A3%E3%83%B3%E3%83%8D%E3%83%AB%E3%80%8D%E3%81%AF/))、1ドル150円前後と仮定すれば0.33ドルとほぼ同水準になる(換算は本レポートの計算で、為替は仮定)。日本の子ども向けに限ったRPMの一次データは存在しない。この水準では月100万回でも月5万円程度で、ショート1,000万回は500〜1,100ドルにしかならない(計算は調査者)。

収益化の入口も上がる見込みである。現行は登録者1,000人と直近12か月4,000時間(またはショート90日1,000万回)だが、2027年2月1日以降の新規申請は**8,000時間またはショート2,000万回**になると複数の二次情報が報じている。YouTube公式の発表文は確認できていない ([NewscastStudio](https://www.newscaststudio.com/2026/08/10/youtube-partner-program-monetization-changes-2027/), [vidIQ](https://vidiq.com/blog/post/youtube-partner-program-changes-2027/))。いま始めるチャンネルは高い方の基準で計画すべきである。

大手も広告以外で稼いでいる。BabyBusはDVD、サンサンキッズTVは書籍とファンコミュニティ、ボンボンアカデミーはアルバムとコンサートを展開する ([value-press](https://www.value-press.com/pressrelease/285040), [PR TIMES](https://prtimes.jp/main/html/rd/p/000000107.000036243.html))。知育アニメで広告月50〜55万円に加え自作の知育プリント・教材で月25〜30万円とする個人のnote記事もあるが、自己申告で検証できない ([note](https://note.com/noxnote/n/nccc8b52204ba))。YouTubeは集客、収益はYouTube外という設計を最初から組み込む必要がある(推測)。

### 音楽の権利は最も不確かな領域である

YouTubeはJASRACと包括許諾契約を結んでいるが、対象は詞と曲であり、既存音源を使うには別途許諾が要る ([YouTube Japan公式ブログ](https://blog.youtube/intl/ja-jp/news-and-events/2023_02_youtube-content-id-jasrac), [首相官邸資料](https://www.kantei.go.jp/jp/singi/titeki2/tizaikyouiku/program/siryou16.pdf))。日本の童謡は歌詞が保護期間中のものが多く、曲ごとの確認が必要である ([GitHub issue](https://github.com/beginerbeginer/jinglescript/issues/2))。AI音楽は条件が動いている。Sunoは有料プランでダウンロードした曲の商用利用を認めるが、2026年に規約が改定され所有権の表現について情報が食い違う。Udioは2025年秋以降ダウンロードが無効化されている ([Suno](https://about.suno.com/blog/suno-updates-tos), [Music In Africa](https://www.musicinafrica.net/magazine/suno-adjusts-ai-music-ownership-terms-after-warner-music-partnership), [Digital Music News](https://www.digitalmusicnews.com/2025/10/31/udio-downloads-disabled-umg-deal/))。資産性が高いのは、オリジナル曲か、パブリックドメイン曲を初版楽譜から自分で編曲しコードで音源化する方法である(推測)。実在の車両デザインや既存キャラクターへの依存も避けるべきだが、この点の法的根拠となる出典は取得できていない。

## 繰り返し・問いかけ・「待ち」が、研究で裏付けのある維持設計である

幼児の視聴維持について、信頼できる根拠があるのは派手さではなく構造である。Blue's Cluesを使った1999年の研究では、同じ回を5日連続で見せると3〜5歳児の理解が上がり、答える・指さすといった参加行動が増え、画面への注視は高いまま保たれた ([APS Observer](https://www.psychologicalscience.org/observer/watch-and-learn))。同番組は手がかりで解くパズルを軸に、編集を最小限にして設計されていた ([Mental Floss](https://www.mentalfloss.com/entertainment/tv/why-blues-clues-repeated-same-episode-five-days))。逆方向の証拠として、4歳児60人を対象にした2011年の実験では、速いテンポのアニメを9分見た直後の実行機能課題の成績が、教育アニメや描画をした群より低かった。ただし測ったのは視聴直後だけである ([EurekAlert](https://www.eurekalert.org/news-releases/674899), [NPR](https://www.npr.org/sections/health-shots/2011/09/12/140401099/spongebob-may-be-too-speedy-for-preschool-brains))。3〜6歳の視線計測研究でも、注意を強く引く素材ほど学習が悪くなる場合が示された ([eScholarship](https://escholarship.org/content/qt0wz74769/qt0wz74769.pdf?t=sgrirx))。

限界も明記しておく。Cocomelonが過刺激だと実証した独立研究はなく、「1〜3秒ごとにカット」といった数字は測定の出典がないブログ由来である ([Medium](https://medium.com/fall-2025-writing-for-interactive-media-icm506/raised-on-noise-how-modern-tv-is-affecting-young-brains-e79f32d3acce))。「低刺激」は間接的に支持されているにすぎず、タイトルや概要欄では「ゆっくり」「おだやか」程度にとどめ、健康や発達への効能はうたわないのが妥当である(推測)。

ここから導ける設計仕様は次のとおりである(調査者の推測を整理したもの)。対象は2〜5歳。長いショットと少ないカット、1区間に1つの内容、問いかけの後に2〜5秒の本当の無音、毎回同じ区間構成。コード描画ではカット頻度も間の長さもパラメータなので、これらを正確に、安く実現できる。日本の視聴実態を重ねると、16:9の高解像度、音量が安定した長尺、そして「おしまい」が子どもにも分かる終わり方が加わる。やめさせると大泣きするという親の悩みに対して、終わりの合図を番組側が持つことは差別化になり得る(推測)。

2歳未満向けは別の注意が要る。画面からの学習は実体験より効率が低い(ビデオ・デフィシット)というのが研究の合意で、2026年の系統的レビューは2歳未満の意図的なスクリーン利用を避けるよう勧告している ([Frontiers](https://www.frontiersin.org/journals/developmental-psychology/articles/10.3389/fdpys.2024.1439040/full), [Euronews](https://www.euronews.com/health/2026/07/02/babies-should-not-use-screens-at-all-in-the-first-two-years-major-review-finds))。需要は伸びているが、小児科的な指針とぶつかる領域であり、「知育」を名乗れば「見せかけの教育」と評される危険がある。乳児向けを作るなら、短く、穏やかで、親子で一緒に見る前提にし、教育効果をうたわないのが安全である(推測)。

配信面で裏付けがあるのは二点である。子ども向けは繰り返し視聴されること(Moonbug親会社のトップが「子どもは何度も何度も見る」と述べている)、そしてCocomelonが単曲・まとめ・ライブ配信を組み合わせていることである ([NBC Bay Area](https://www.nbcbayarea.com/news/business/money-report/as-streaming-services-chase-profitability-kids-content-is-king/3917196/))。日本でも泣き止み3曲を束ねた約21分の連続再生が2,600万回を超え、ソポアートパークは60分まとめを複数出している ([mamab](https://mamab.jp/article/51081), [ユーチュラ](https://yutura.net/channel/127049/video/QiBpXKpzlP0/))。1〜3分の単位で作り、10〜60分のまとめに再編して二重に資産化するのが標準手法だと推測できる。一方、子ども向けチャンネルの流入元の内訳、テレビ視聴比率、最適なまとめの長さ、投稿頻度、サムネイルの効果を測ったデータは見つからなかった。サムネイルとタイトルは、扇情的・誤解を招くものが低品質の例に挙がっている以上、大きく単純な対象物と正確な題名にとどめるのが規約上も安全である。

## 制作の道具はほぼ無料で、難所は音楽とキャラクターの魅力にある

描画環境の費用はほとんどかからない。Reactで動画を記述するRemotionは、個人なら商用でも無料ライセンスの対象とされる(バージョン5.0で変更予告があり、公開時に再確認が必要) ([Remotion](https://www.remotion.dev/docs/license/faq), [LICENSE.md](https://raw.githubusercontent.com/remotion-dev/remotion/HEAD/LICENSE.md))。ナレーションは、ElevenLabsなら有料プランで商用利用でき、最安の商用プランは月5ドルとする二次情報がある ([ElevenLabs](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform), [BIGVU](https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs/))。日本語ではVOICEVOXがクレジット表記を条件に商用利用可とされるが、キャラクターごとに個別の禁止事項があり、公式規約は今回読めていない ([Crystal Method](https://crystal-method.com/blog/voicevox-commercial/))。Manim、Motion Canvas、ffmpegなどのライセンスは未確認である。

想定できる工程は次のとおりである(調査者が組み立てたもので、出典のある実例ではない)。各話の仕様をデータ(出題、答え、間の長さ)として書く。コード生成モデルが場面の部品を書き足す。音声を1行ずつ生成し、実測した長さでタイムラインを組む。権利の明確な音楽を当てる。ヘッドレスで書き出す。文字のはみ出し、音割れ、カット頻度、表記を自動検査し、そのうえで全話を人が見る。話の区間からまとめを組み、言語ごとに再レンダリングする。現金費用は音声・音楽の月額と計算資源が中心で、月に数十ドル規模と見積もられるが、これも推定である。

コードで描きやすい順に並べると(調査者の評価)、容易なのは高コントラストの図形ループ、色・形・数・文字の提示、数え上げ、シルエットや「なにが隠れている?」のクイズ、仲間はずれ探し、子守歌の映像。中程度が2D物理のボール落下やマーブルラン(衝突で音が鳴る)。最も難しいのが、魅力的な造形とリグが要る「踊るキャラクター」である。Hey Bearが1本に数か月をかけている事実が、その品質水準を示す。

コード描画がAIスロップと区別される根拠は実在する。報道で問題になったのは歪んだ顔、余分な手足、崩れた文字だった ([Digital Trends](https://digitaltrends.com/social-media/investigation-finds-youtube-is-serving-mindless-ai-slop-to-toddlers-and-preschoolers))。決定論的なベクター描画にはそれが起こらず、画面上の文字や数は自動テストで検証できる。ただし前述のとおり、規約が見るのは道具ではなく量産性である。多言語展開も、YouTubeが多言語音声トラックで視聴時間の平均25%超が非主要言語から来たと公表しており、画面文字の再描画と音声差し替えが安いコード制作には相性が良い。ただし子ども向け動画での効果は未確認である ([YouTube Blog](https://blog.youtube/news-and-events/multi-language-audio/))。

## 提案:推奨は「待ってくれるクイズ知育」、次点は生活習慣ソング

以下はすべて、ここまでの調査結果に基づく**本レポートの提案(推測)**であり、同種のチャンネルの成功実績で裏付けられたものではない。評価軸は、コードでの描きやすさ、量産と見なされにくさ、日本市場の隙間、弱点の四つである。

| 順位 | 案 | コード描画 | 量産判定の回避 | 日本の隙間 | 主な弱点 |
|---|---|---|---|---|---|
| 1(推奨) | 2〜5歳向け低刺激クイズ知育+家事時間用まとめ | 容易 | 出題の中身を毎回変えれば可 | 日本語・日本の題材、テレビ長尺、低刺激 | クイズ形式の再生実績データがない |
| 2 | 生活習慣のオリジナルソング(少本数) | 中 | 高い(1本ずつ別作品) | 東京ハイジ以降の空き、海外勢が弱い | 作曲と歌唱が難所 |
| 3 | 0〜1歳向けオノマトペ感覚動画(多言語展開) | 容易 | 低い(似通いやすい) | 月齢特化は供給が薄い可能性 | 小児科指針と衝突、先行者あり |
| 4 | 物理シミュレーションの音あそび | 中 | 中 | 言語不要で海外にも出せる | 需要の裏付けが皆無 |
| 5 | 園行事・季節もの | 容易〜中 | 中 | 海外勢が作れない | 季節限定、歌が要る |
| 見送り | のりもの、定番童謡カバー、汎用の色・数字 | 容易 | 低い | なし | 飽和、権利、量産の典型 |

### 推奨案:問いかけて、待って、答える番組

内容は、オリジナルの案内役キャラクター1体が毎回ひとつの問いを出す2〜4分の話である。シルエットから当てる、少しずつ見えてくる、ひとつだけ違うものを探す、音から当てる、数える、といった出題に、**問いの後の数秒の無音**を必ず置く。題材は日本の生活に寄せる。ひらがなの最初の音、オノマトペ(ぴょんぴょん、ごろごろ)、日本の食べ物や季節、園の持ち物などである。これを20〜30分のまとめに編成し、終わりには毎回同じ「おしまい」の区間を置く。

この案を第一に推す理由は五つある。第一に、研究で裏付けのある設計(繰り返し、参加、少ない編集)と形式が一致し、「低刺激」を誇張なしに説明できる。第二に、文字と数の正確さ、間の制御というコード描画の強みがそのまま品質になり、キャラクターの演技力というコード描画の弱みに依存しない。第三に、2〜5歳は動画接触が急伸する年齢帯で(2歳で64.4%)、2歳未満向けのような指針との衝突が小さい。第四に、ひらがなやオノマトペは海外スタジオの翻訳コンテンツが構造的に弱い領域である。第五に、歌を必須としないため、最も不確かな音楽の権利問題を避けやすい。

弱点も明確である。シルエットクイズ等の再生実績は今回の調査で一件も取得できておらず、需要は未検証である。そして出題だけ差し替える構成は、量産判定の典型例に最も近い。対策は、話ごとに出題の仕組み・脚本・絵・音を実質的に変えること、シリーズを複数の型で構成すること、投稿を週1〜2本程度に抑えること、全話を人が確認することである。量産の基準となる本数や類似度をYouTubeは公表していないため、どこまでが安全かは分からない。

運用上の決めごととして、視聴者設定は動画ごとに行う。概要欄には制作方法(コードによる描画、合成音声の使用とクレジット)を書く。タイトルは定型の効能語(「泣き止む」等)を並べず、内容を正確に表す。各話の仕様・生成記録・ライセンスの領収を保管する。収益は当初から印刷用の知育プリントなどYouTube外に置く。YouTube Kidsへの掲載は期待しない。

### 第2案と第3案の位置づけ

生活習慣ソングは、日本で最も確かな単体ヒットの型である。はみがき、トイレ、おきがえ、おかたづけ、ねんねといった場面は親が毎日再生する理由を持ち、1本ずつが別作品なので量産判定からも遠い。問題は制作で、耳に残る旋律と歌声はコード生成の得意分野ではなく、歌唱合成の手段と権利は今回調査されていない。推奨案でチャンネルの土台を作りつつ、四半期に1本程度、時間をかけた「看板曲」として投入するのが現実的である。

0〜1歳向けの感覚動画は、描くのは最も簡単で、言葉がほぼ不要なので多言語展開もしやすい。しかし似通いやすく、ピカブーきっずchやソポアートパークという先行者がいて、小児科の指針とも衝突する。主軸にはせず、別チャンネルでの小規模な実験にとどめるのがよい。Hey Bear型の「踊るキャラクター」は、品質水準を考えると個人のコード制作では後回しにすべきである。

## Conclusion

調査全体が示すのは、「AIで安く大量に」という発想と、この市場で実際に生き残る条件が正反対を向いているという事実である。単価が最低であることは量を求めさせるが、量は処分の引き金であり、少本数で何度も見られる動画だけが単価の低さを繰り返し視聴で補える。コード生成の価値は制作速度ではなく、正確さと間の設計を1話ごとに作り込める点にある。速く作れる分の時間を、本数ではなく1話あたりの差異と検品に回せるかどうかが分かれ目になる。

残る不確実性は大きく、順に潰す必要がある。まず、クイズ形式の需要は未検証なので、最初の10本程度で視聴維持率と再視聴を見て、形式を入れ替える判断基準を先に決めておくこと。次に、ポリシーは短期間で変わり得るので、公開書簡後の子ども向けAI規制、2027年2月の収益化基準、made for kidsで無効になる機能の現行一覧を、公式ヘルプで直接確認すること。最後に、本レポートの数字はすべて検索要約に基づく未検証値であり、投資判断の前に主要な数値(各チャンネルの現況、RPM、規約文言)を原典で確かめることが前提になる。
