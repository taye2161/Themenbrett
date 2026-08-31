export function ErrorFallback({error}: {error: unknown}){
    return (
        <div>
            <h1>Something went wrong</h1>
            <pre>{error instanceof Error ? error.message : String(error)}</pre>
            <pre>{error instanceof Error ? error.stack : 'no stack available'}</pre>
        </div>
    )
}