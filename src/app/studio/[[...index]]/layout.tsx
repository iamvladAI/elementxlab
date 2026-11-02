export const metadata = {
  title: 'Sanity Studio',
  description: 'Manage your website content',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="m-0 p-0" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
