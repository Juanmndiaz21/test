import LoadingWheel from '@/components/LoadingWheel';

export default function RootLoading() {
    return (
        <div
            className="min-h-[70vh] flex flex-col items-center justify-center px-4"
            role="status"
            aria-label="Loading"
        >
            <LoadingWheel size="xl" showLogo={true} label="OGmodz Standings" />
        </div>
    );
}