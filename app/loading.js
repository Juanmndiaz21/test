import LoadingWheel from '@/components/LoadingWheel';

export default function AppRootLoading() {
    return (
        <div
            className="min-h-screen bg-[#0d0914] flex flex-col items-center justify-center px-4"
            role="status"
            aria-label="Loading"
        >
            <LoadingWheel size="xl" showLogo={true} label="OGmodz" />
        </div>
    );
}
