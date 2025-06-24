
type HookDetail ={
  name: string;
  line: number;
  importedFrom: string;
  description?: string;
  numArgs: number;
  firstArgSummary?: string;
}


export default function HookDetailsTable({data}:{data:HookDetail[]}){
    console.log(data.length);
    if(!data.length) return <p className="text-gray-500">No hooks.found</p>;

    return(
        <table className="table-auto w-full border text-red-800 border-gray-300 mt-4">
      <thead>
        <tr className="bg-gray-100 text-center">
          <th className="px-4 py-2">Hook</th>
          <th className="px-4 py-2">Line</th>
          <th className="px-4 py-2">Source</th>
          <th className="px-4 py-2">Args</th>
          <th className="px-4 py-2">First Arg</th>
          <th className="px-4 py-2">Description</th>
        </tr>
      </thead>
      <tbody>
        {data.map((hook, idx) => (
          <tr key={idx} className="border-t">
            <td className="px-4 py-2">{hook.name}</td>
            <td className="px-4 py-2">{hook.line}</td>
            <td className="px-4 py-2">{hook.importedFrom || 'Unknown'}</td>
            <td className="px-4 py-2">{hook.numArgs ?? '-'}</td>
            <td className="px-4 py-2">{hook.firstArgSummary?? '-'}</td>
            <td className="px-4 py-2">{hook.description ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    );
}