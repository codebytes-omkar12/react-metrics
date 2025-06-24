import  {useState,useEffect} from 'react';

// const files = [
//    'components/TestComponent.tsx',
//    'components/ChildComponent.tsx',
//    'hooks/usePerformanceMonitor.tsx'
// ]

export default function HookFilePicker({onAnalyze}:{onAnalyze:(path:string)=>void}){
    const[selected, setSelected] = /* state to store and update the value of an <option> element in a drop-down list that should get selected.*/useState('');

    const[fileList,setFileList] = /* state to store and update the files displayed in a drop-down list.*/useState<string[]>([]);
/*Populate the value of fileList with all the TSX files on resolve of the fetching of the data using API*/
useEffect(()=>{
        fetch('http://localhost:5001/list-files')
        .then(res=>res.json())
        .then(setFileList);
    },[])

    return(
        <div className="space-y-2">
            <select
               className='border p-2 rounded'
               value={selected}
               onChange={(e)=>{
                setSelected(e.target.value);
                onAnalyze(e.target.value);
               }}>
                <option value="">Select a component...</option>
                {fileList.map((file)=>(<option key={file} value={file}>{file}</option>))}
               </select>
        </div>
    )
}