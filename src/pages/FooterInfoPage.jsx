export const FooterInfoPage = ({ title, description }) => (
  <section className="bg-gray-50 py-10">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-brand">{title}</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">{description}</p>
        <p className="mt-4 text-sm text-gray-500">
          Temporary placeholder content. We can replace this with final content anytime.
        </p>
      </div>
    </div>
  </section>
);
