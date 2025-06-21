"use client";

import Image from "next/image";
import WaveBackground from "../components/ui/wave";
import BlurText from "../components/ui/blur";
import SplitText from "../components/ui/split";
import Header from "../components/ui/Header";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleClick = () => {
    router.push("/interview/new")
  }
  const handleClick2 = () => {
    router.push("/interview")
  }


  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <WaveBackground className="" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Hero content frame */}
          <div className="relative inline-block mb-15">
            <div
              className="rounded-3xl "
              style={{
                backgroundColor: "rgba(197, 228, 212, 0.1)",
                backdropFilter: "blur(3px) saturate(65%)",
                WebkitBackdropFilter: "blur(30px) saturate(65%)",
                border: "2px solid rgba(210, 211, 210, 0.2)",
              }}
            >
              <div className="px-8 pb-12 mt-28 mb-8">
                <h1 className="text-4xl text-center lg:text-6xl font-bold text-[#163300] mb-6 leading-tight">
                  内定まで、何度でも叩き込む。
                  <br />
                  <span className="text-[#9fe870]">AI面接官</span>
                  、24時間フル稼働。
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto font-bold text-center">
                  就活の「面接」って、練習の場がなかなかない。
                  <br />
                  でも、ぶっつけ本番で挑むには、あまりにリスクが大きい。
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="cursor-pointer bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg"
                  onClick={handleClick}>
                    無料で体験する
                  </button>
                  <button className="cursor-pointer border-2 border-[#163300] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#163300] hover:text-white transition-colors"
                  onClick={handleClick2}>
                    サービス詳細
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-gray-200/100 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-4xl text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mr-10 ">
              そんなあなたのために、
              <br />
              私たちはAI面接官を開発しました。
            </h2>
            <p className="text-gray-600 font-bold mt-6">
              AIとリアルタイムで対話しながら、実際の面接に近い形式で練習ができます。
              <br />
              いつでも・何度でも挑戦可能。
            </p>
          </div>
          <div className="flex-1">
            <img
              src="/soundwave.png"
              alt="Soundwave"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white shadow-sm hover:shadow-lg transition-shadow rounded-2xl border border-gray-100 p-6">
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
                リアルタイム面接練習
              </h3>
              <p className="text-gray-600">
                AIが面接官として質問し、自然な会話形式で面接の流れを体験できます。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white shadow-sm hover:shadow-lg transition-shadow rounded-2xl border border-gray-100 p-6">
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
                面接パフォーマンス評価
              </h3>
              <p className="text-gray-600">
                多角的な視点からあなたの面接パフォーマンスを分析・評価します。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white shadow-sm hover:shadow-lg transition-shadow rounded-2xl border border-gray-100 p-6">
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
                フィードバックと強み発見
              </h3>
              <p className="text-gray-600">
                弱点の改善だけでなく、あなたの長所も発見し、より魅力的にアピールできるようサポートします。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center text-white bg-[#163300] rounded-3xl py-16">
            <div className="w-16 h-16 bg-[#9fe870] rounded-full flex items-center justify-center mx-auto mb-8">
              <svg
                className="w-8 h-8 text-[#163300]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6"
                />
              </svg>
            </div>
            <h2 className="text-5xl lg:text-5xl font-bold mb-8">
              面接が怖い、自信がない
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              そんな不安を「準備した」という安心変えていきませんか？
              <br />
              就活の不安を「可視化」し、「成長」に変える。
              <br />
              あなたの本気に、本気で応えるAI面接サービス。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="cursor-pointer bg-[#9fe870] text-[#163300] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#8fd960] transition-colors shadow-lg"
              onClick={handleClick}>
                デモを試す
              </button>
              <button className="cursor-pointer text-[#9fe870] px-8 py-4 rounded-full font-semibold text-lg hover:underline transition-colors"
              onClick={handleClick2}>
                詳細を見る
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10 mb-17 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#163300] mb-8">
              まずは一度、体験してみてください。
              <br />
              あなたの可能性、きっと広がります。
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="cursor-pointer bg-[#9fe870] text-[#163300] px-10 py-4 rounded-full font-semibold text-xl hover:bg-[#8fd960] transition-colors shadow-lg"
              onClick={handleClick}>
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
      <footer className="bg-[#163300] text-white py-12 relative z-10">
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
