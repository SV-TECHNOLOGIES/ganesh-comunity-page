import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const eventId = "cmu8fbb720000141sx0p856rb";
    const mediaItemId = "cmvmnm6c80001qpotxm6pcrfh";
    
    const coverContains = "bathukamma2026_mvmlv8v8";

    const allMedia = await prisma.mediaItem.findMany({
        where: { eventId: eventId }
    });

    console.log(allMedia.length);

    const mediaItem = await prisma.mediaItem.findUnique({
        where: {id:mediaItemId}
    });

    const images: string[] = [...mediaItem?.images || []]
    console.log("before images array",images.length);
    allMedia?.forEach((item) => {
        if(item.id !== mediaItemId){
            images.push(...item.images);
            
        }
    })
    console.log("after images array",images.length);

    

    // remove duplicates 
    let uniqueImages = [...new Set(images)];

    uniqueImages.forEach((image) => {
        if(image.includes(coverContains)){
            console.log(image);
            uniqueImages = uniqueImages.filter((item) => item !== image);
            uniqueImages.unshift(image);
        }
    })

    console.log("first image",uniqueImages[0]);
    console.log("coverContains",uniqueImages[0].includes(coverContains));

    console.log("unique images array",uniqueImages.length);

    await prisma.mediaItem.update({
        where: {id:mediaItemId},
        data: {
            images: uniqueImages
        }
    })


}

main().finally(() => prisma.$disconnect());