import LoadingWheel from '@/components/LoadingWheel';

export default function AdminLoading() {
    return (
        <div
            className="min-h-[70vh] flex flex-col items-center justify-center px-4"
            role="status"
            aria-label="Loading Admin Control Room"
        >
            <LoadingWheel size="lg" showLogo={false} label="OGmodz Staff · Admin" />
        </div>
    );
}
