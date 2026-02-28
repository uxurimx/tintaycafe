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
        // 1. First try Google Books API
        let googleData = null;
        try {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                googleData = data.items[0].volumeInfo;
            } else if (data.error && data.error.code === 429) {
                console.warn(`[Google Books API] Rate limit exceeded for ISBN: ${isbn}`);
            }
        } catch (err) {
            console.error("Error checking Google Books API:", err);
        }

        // Return Google Data if found
        if (googleData) {
            return NextResponse.json({
                title: googleData.title,
                authors: googleData.authors || [],
                publisher: googleData.publisher,
                publishedDate: googleData.publishedDate,
                description: googleData.description,
                pageCount: googleData.pageCount,
                categories: googleData.categories || [],
                imageLinks: googleData.imageLinks,
                isbn: isbn
            });
        }

        // 2. Fallback to Open Library API
        try {
            const olResponse = await fetch(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
            );
            const olData = await olResponse.json();
            const bookKey = `ISBN:${isbn}`;

            if (olData[bookKey]) {
                const bookInfo = olData[bookKey];
                const authors = bookInfo.authors ? bookInfo.authors.map((a: any) => a.name) : [];
                const publisher = bookInfo.publishers && bookInfo.publishers.length > 0 ? bookInfo.publishers[0].name : undefined;
                
                return NextResponse.json({
                    title: bookInfo.title,
                    authors: authors,
                    publisher: publisher,
                    publishedDate: bookInfo.publish_date,
                    description: bookInfo.subtitle || "No description available",
                    pageCount: bookInfo.number_of_pages,
                    categories: bookInfo.subjects ? bookInfo.subjects.map((s: any) => s.name) : [],
                    imageLinks: bookInfo.cover ? { thumbnail: bookInfo.cover.large || bookInfo.cover.medium || bookInfo.cover.small } : undefined,
                    isbn: isbn
                });
            }
        } catch (err) {
            console.error("Error checking Open Library API:", err);
        }

        // 3. Fallback exhausted
        return NextResponse.json({ error: "Book not found" }, { status: 404 });

    } catch (error: any) {
        console.error("Error fetching book data:", error);
        return NextResponse.json({
            error: "Internal server error",
            message: error.message || "Unknown error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
