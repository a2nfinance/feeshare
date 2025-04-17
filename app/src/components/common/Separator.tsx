export const Separator = ({ title }: { title: string }) => {
    return (
        <div className="relative text-left text-md after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background text-muted-foreground">
                {title}
            </span>
        </div>
    )
}