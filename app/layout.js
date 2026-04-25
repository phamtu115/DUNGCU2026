// app/layout.js

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {/* Nơi nội dung của các page sẽ được render vào đây */}
        {children}
      </body>
    </html>
  );
}