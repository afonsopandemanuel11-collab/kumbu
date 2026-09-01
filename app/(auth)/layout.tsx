export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-kumbu-50 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-kumbu-900">
          KUMBU
        </h1>
        <p className="mt-1 text-sm text-kumbu-500">Gestão Financeira Pessoal</p>
        <p className="mt-3 text-sm font-medium text-kumbu-700">
          O teu dinheiro. O teu controlo.
        </p>
      </div>
      {children}
    </div>
  );
}
