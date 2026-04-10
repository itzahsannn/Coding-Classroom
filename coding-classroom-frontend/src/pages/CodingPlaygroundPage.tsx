import DashboardTopBar from '@/components/layout/DashboardTopBar'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const INITIAL_CODE = {
  'main.js': `// Define a function to calculate factorial
function factorial(n) {
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

console.log("Factorial of 5 is:", factorial(5));`,
  'script.py': `# Define a function to calculate factorial
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

print("Factorial of 5 is:", factorial(5))`
}

export default function CodingPlaygroundPage() {
  const navigate = useNavigate()
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState<string | null>(null)
  
  const [activeFile, setActiveFile] = useState<'main.js' | 'script.py'>('main.js')
  const [files, setFiles] = useState(INITIAL_CODE)

  const handleRun = () => {
    setIsRunning(true)
    setOutput(null)
    setTimeout(() => {
      if (activeFile === 'main.js') setOutput('Factorial of 5 is: 120')
      if (activeFile === 'script.py') setOutput('Factorial of 5 is: 120')
      setIsRunning(false)
    }, 600)
  }

  return (
    <div className="min-h-full bg-[#FAF9F6] font-[Inter] flex flex-col h-screen">
      <DashboardTopBar 
        breadcrumbs={
          <>
            <button onClick={() => navigate('/dashboard')} className="hover:text-[#1967D2] transition-colors">Course</button>
            <span className="mx-2 text-gray-400">›</span>
          </>
        }
      />

      <div className="flex-1 flex flex-col p-4 lg:p-6 pb-0 w-full max-w-[1400px] mx-auto min-h-0 h-[calc(100vh-3.5rem)]">
        
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-t-xl lg:rounded-xl shadow-sm overflow-hidden min-h-0">
          
          {/* Editor Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0 bg-white gap-3 overflow-x-auto">
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setActiveFile('main.js')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md border ${
                  activeFile === 'main.js' ? 'border-blue-200 bg-blue-50/30 shadow-sm text-gray-900 pointer-events-none' : 'border-transparent text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="#F7DF1E" className="w-4 h-4">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M3 3h18v18H3V3zm11.5 5.5v3.3h-2V13h-2v-4.5h4v-3H9v9h9V8.5h-3.5zM7 16v-1.5h4.5v-3H7v-3h7V16H7z" fill="none"/>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H7v-1.5h4.5v-3H7v-3h7V16zm4-7.5v3.3h-2V13h-2v-4.5h4v-3H9v9h9V8.5h-3.5z" fill="#F7DF1E"/>
                  <rect x="0" y="0" width="24" height="24" fill="#F7DF1E" />
                  <path d="M11.604 18.062c-.08-.43-.284-.69-.607-.824-.316-.142-.76-.142-1.332-.012l-1.07-.98c.552-.525 1.157-.852 1.836-1.002.684-.153 1.374-.08 2.062.2.66.275 1.163.743 1.517 1.408.35.666.452 1.488.3 2.457H13c-.027-.375-.166-.757-.406-1.127-.245-.37-.626-.543-1.12-.55-.386-.014-.72.083-1.01.277-.282.2-.423.498-.423.905 0 .4.244.757.734 1.05.485.297.942.544 1.344.773a14.773 14.773 0 0 1 1.258.825c.34.256.62.532.842.824.232.296.388.623.47 1 .094.39.094.81-.005 1.257-.087.674-.383 1.23-.888 1.666-.5.43-1.11.705-1.83.827-.723.118-1.463-.03-2.22-.44-.75-.417-1.3-1.08-1.636-1.996l1.246-.867c.184.59.488.995.9 1.21.397.23.832.203 1.286-.062.427-.266.634-.69.605-1.28-.016-.402-.27-.753-.787-1.066a13.315 13.315 0 0 0-1.638-1.014c-.663-.42-1.173-.86-1.545-1.34-.374-.476-.566-1.086-.593-1.834zm-7.668 5.76C3.93 23.366 3.93 22 3.93 22l1.634-.412s-.167 1.26.177 1.637c.355.452 1.002.508 1.002.508s.867-.024 1.135-.595c.203-.43.08-1.684.08-1.684V13.88h1.614v8.307s-.066 1.83-2.072 2.054c-1.393.18-2.67-.107-3.564-4.2z" fill="#000"/>
                </svg>
                <span className="text-sm font-semibold">main.js</span>
              </div>
              
              <div 
                onClick={() => setActiveFile('script.py')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md border ${
                  activeFile === 'script.py' ? 'border-blue-200 bg-blue-50/30 shadow-sm text-gray-900 pointer-events-none' : 'border-transparent text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="#3776AB" className="w-4 h-4">
                   <path d="M14.2 1.1c-4.5 0-4.3 2-4.3 2v2.2h4.5v1H5.7s-2.1.2-2.1 4.5.8 4.3.8 4.3h1.9V13c0-2.3 2-2.3 2-2.3h4.6s2.5.3 2.5-2.6c0-3.1-3-3.1-3-3.1V2s-1-.9-3.2-.9zM12 2.7c.6 0 1 .5 1 1 0 .6-.4 1-1 1s-1-.4-1-1c0-.6.4-1 1-1zm-4.3 12.2V17h4.5v1H3.6s-2.1-.2-2.1 4.5.8 4.3.8 4.3h1.9v-2.1c0-2.3 2-2.3 2-2.3h4.6s2.5.3 2.5-2.6V17s1 .9 3.2.9c4.5 0 4.3-2 4.3-2v-2.2H9.8v-1z"/>
                </svg>
                <span className="text-sm font-medium">script.py</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select 
                  value={activeFile === 'main.js' ? 'JavaScript' : 'Python'}
                  onChange={() => {}}
                  className="appearance-none bg-white border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 outline-none hover:bg-gray-50"
                >
                  <option>JavaScript</option>
                  <option>Python</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              
              <button 
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] text-white text-sm font-medium rounded-md transition-colors shadow-sm disabled:opacity-70"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          {/* Code Area */}
          <div className="flex-1 flex overflow-hidden">
            <div className="w-12 bg-gray-50 border-r border-gray-100 flex flex-col items-end py-4 pr-3 select-none text-[13px] text-gray-400 font-mono leading-[24px]">
              {files[activeFile].split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea 
              value={files[activeFile]}
              onChange={(e) => setFiles(prev => ({ ...prev, [activeFile]: e.target.value }))}
              spellCheck={false}
              className="flex-1 bg-white outline-none resize-none p-4 text-[13px] text-gray-800 font-mono leading-[24px] whitespace-pre"
            />
          </div>

          {/* Terminal Output */}
          <div className="h-40 md:h-64 bg-[#1e1e1e] flex flex-col shrink-0">
            <div className="px-4 py-2 border-b border-gray-700/50">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Terminal Output</span>
            </div>
            <div className="flex-1 p-4 overflow-auto font-mono text-sm leading-relaxed">
               {output !== null ? (
                 <>
                  <div><span className="text-green-500">$</span> <span className="text-white">{activeFile === 'main.js' ? 'node main.js' : 'python script.py'}</span></div>
                  <div className="text-white">{output}</div>
                  <div className="mt-4 flex items-center gap-2"><span className="text-green-500">$</span> <span className="w-2 h-4 bg-gray-400 animate-pulse"></span></div>
                 </>
               ) : isRunning ? (
                 <div><span className="text-green-500">$</span> <span className="text-white">{activeFile === 'main.js' ? 'node main.js' : 'python script.py'}</span></div>
               ) : (
                 <div className="flex items-center gap-2"><span className="text-green-500">$</span> <span className="w-2 h-4 bg-gray-400 animate-pulse"></span></div>
               )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
