export default function Footer() {
  return (
    <footer className="w-full bg-white text-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-4 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Akshit. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
