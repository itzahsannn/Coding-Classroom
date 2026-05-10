const Footer = () => {
  const year = new Date().getFullYear()

  const footerLinks = {
    Product: ['Courses', 'Features', 'Pricing', 'Changelog'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Legal: ['Privacy', 'Terms', 'Cookie Policy'],
  }

  return (
    <footer className="border-t border-white/5 bg-gray-950/50 mt-16">
      <div className="section pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                C
              </div>
              <span className="font-bold gradient-text">Code Classroom</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Learn to code with interactive lessons, real projects, and a vibrant community.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-500 hover:text-brand-300 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {year} Code Classroom. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Built with ❤️ and TypeScript
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
