import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#163300]">プロイー</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-[#163300] hover:text-[#9fe870] transition-colors font-medium">
                ログイン
              </button>
              <button className="bg-[#9fe870] text-[#163300] px-6 py-2 rounded-full font-medium hover:bg-[#8fd960] transition-colors">
                無料で始める
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-[#163300] mb-6 leading-tight">
              内定まで、何度でも叩き込む。
              <br />
              <span className="text-[#9fe870]">AI面接官</span>、24時間フル稼働。
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              就活の「面接」って、練習の場がなかなかない。
              <br />
              でも、ぶっつけ本番で挑むには、あまりにリスクが大きい。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg">
                無料で体験する
              </button>
              <button className="border-2 border-[#163300] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#163300] hover:text-white transition-colors">
                サービス詳細
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-[#edefec] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mb-8">
              そんなあなたのために、
              <br />
              私たちはAI面接官を開発しました。
            </h2>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#163300]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#163300] mb-4">
                リアルタイム対話で、実践さながらの面接練習
              </h3>
              <p className="text-gray-600">
                AIが面接官として質問し、自然な会話形式で面接の流れを体験できます。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#163300]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#163300] mb-4">
                回答の内容、構成、表現、話し方を徹底的に評価
              </h3>
              <p className="text-gray-600">
                多角的な視点からあなたの面接パフォーマンスを分析・評価します。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-[#9fe870] rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#163300]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#163300] mb-4">
                改善点を具体的にフィードバック。あなたの強みも見つけ出します。
              </h3>
              <p className="text-gray-600">
                弱点の改善だけでなく、あなたの長所も発見し、より魅力的にアピールできるようサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="bg-[#edefec] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mb-8">
              面接が怖い、自信がない——
              <br />
              そんな不安を
              <span className="text-[#9fe870]">「準備した」という安心</span>に
              <br />
              変えていきませんか？
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              就活の不安を「可視化」し、「成長」に変える。
              <br />
              あなたの本気に、本気で応えるAI面接サービス。
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mb-8">
              まずは一度、体験してみてください。
              <br />
              あなたの可能性、きっと広がります。
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-xl hover:bg-[#8fd960] transition-colors shadow-lg">
                今すぐ無料で始める
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ※ 無料プランでは3回まで面接練習が可能です
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#163300] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">プロイー</h3>
              <p className="text-gray-300">AI面接練習で内定を掴む</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サービス</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    AI面接練習
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    フィードバック
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    料金プラン
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    ヘルプセンター
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    お問い合わせ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    利用規約
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">会社情報</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    会社概要
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    プライバシーポリシー
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#9fe870] transition-colors"
                  >
                    採用情報
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-300">
              © 2024 プロイー. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
