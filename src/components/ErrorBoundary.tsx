import React from 'react';

type ErrorBoundaryProps={
    children:React.ReactNode;
    fallback:React.ReactNode;
}

type ErrorBoundaryState={
    hasError:boolean;
    error:Error | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps,ErrorBoundaryState>{
    constructor(props:ErrorBoundaryProps){
        super(props);
        this.state={hasError:false,error:null};
    }
    static getDerivedStateFromError(error:Error){
        return { hasError:true , error};
    }
    render(){
          if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          <h2>Something went wrong.</h2>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
    }
}

export default ErrorBoundary