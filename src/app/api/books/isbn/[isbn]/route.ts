import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ isbn: string }> }
) {
    const { isbn } = await params;

    if (!isbn) {
        return NextResponse.json({ error: "ISBN is required" }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        );
        const data = await response.json();

        if (data.totalItems === 0) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }

        const bookInfo = data.items[0].volumeInfo;

        return NextResponse.json({
            title: bookInfo.title,
            authors: bookInfo.authors || [],
            publisher: bookInfo.publisher,
            publishedDate: bookInfo.publishedDate,
            description: bookInfo.description,
            pageCount: bookInfo.pageCount,
            categories: bookInfo.categories || [],
            imageLinks: bookInfo.imageLinks,
            isbn: isbn
        });
    } catch (error: any) {
        console.error("Error fetching book data:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error.message || "Unknown error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
