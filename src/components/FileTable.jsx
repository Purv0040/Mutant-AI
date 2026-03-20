const tableData = [
  {
    name: 'Invoice_Oct2024.pdf',
    type: 'PDF',
    category: 'Finance',
    tags: ['Vendor: Infosys', '₹2,40,000', 'Due: 15 Nov'],
    confidence: 94,
  },
  {
    name: 'Employee_Contract_Priya.pdf',
    type: 'PDF',
    category: 'HR',
    tags: ['Name: Priya Sharma', 'Role: SDE-2'],
    confidence: 97,
  },
  {
    name: 'Product_Roadmap_H2.pptx',
    type: 'PPT',
    category: 'Management',
    tags: ['22 slides', '3 milestones', 'Q4 launch'],
    confidence: 89,
  },
  {
    name: 'NDA_ClientX_Signed.pdf',
    type: 'PDF',
    category: 'Legal',
    tags: ['Party: ClientX', 'Valid: 2 yrs'],
    confidence: 91,
  },
  {
    name: 'Server_Costs_Q3.xlsx',
    type: 'XLSX',
    category: 'IT / Infra',
    tags: ['₹18.4L total', 'AWS/GCP'],
    confidence: 86,
  },
]

const typeStyle = {
  PDF: 'bg-red-100 text-red-700',
  XLSX: 'bg-green-100 text-green-700',
  PPT: 'bg-amber-100 text-amber-700',
}

const categoryStyle = {
  Finance: 'bg-green-100 text-green-800',
  HR: 'bg-blue-100 text-blue-800',
  Management: 'bg-amber-100 text-amber-800',
  Legal: 'bg-pink-100 text-pink-800',
  'IT / Infra': 'bg-purple-100 text-purple-800',
}

function ConfidenceBar({ value }) {
  const color = value >= 90 ? 'bg-green-500' : 'bg-amber-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-high rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] text-on-surface-variant font-medium w-7 text-right">{value}%</span>
    </div>
  )
}

export default function FileTable({ data = tableData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-surface-high">
            <th className="text-left py-2.5 px-4 font-medium text-on-surface-variant text-[11px] uppercase tracking-wider">File Name</th>
            <th className="text-left py-2.5 px-4 font-medium text-on-surface-variant text-[11px] uppercase tracking-wider">Type</th>
            <th className="text-left py-2.5 px-4 font-medium text-on-surface-variant text-[11px] uppercase tracking-wider">Category</th>
            <th className="text-left py-2.5 px-4 font-medium text-on-surface-variant text-[11px] uppercase tracking-wider">Extracted Info</th>
            <th className="text-left py-2.5 px-4 font-medium text-on-surface-variant text-[11px] uppercase tracking-wider w-36">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.name}
              className={`border-b border-surface-high hover:bg-surface-low transition-colors ${i % 2 === 1 ? 'bg-surface-low/50' : ''}`}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {row.type === 'PDF' ? '📄' : row.type === 'XLSX' ? '📊' : '📋'}
                  </span>
                  <span className="font-medium text-on-surface truncate max-w-[200px]">{row.name}</span>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${typeStyle[row.type]}`}>
                  {row.type}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${categoryStyle[row.category]}`}>
                  {row.category}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {row.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[11px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-3 px-4">
                <ConfidenceBar value={row.confidence} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
