import {writeFileSync, existsSync, mkdirSync} from "node:fs";

export class Stealer {
    static expression = /([^"]+)\.png/g;
    static tiers = ["bronze", "silver", "gold", "platinum"];
    static url = "https://socialclub.rockstargames.com/games/gtav/career/awardsajax";
    static options = {
        method: "GET",
        headers: {
            "Cookie": "AutoLoginCheck=1;",
            "Host": "socialclub.rockstargames.com",
            "User-Agent": "Chrome/119.0.0.0",
        },
        redirect: "follow",
    };
    

    html;
    pngs;
    
    async Run() {
        this.CreateFoldersIfNotExist()
        this.html = await this.GetHtml();
        this.pngs = await this.GetPngsOutOfHtml();
        this.pngs.push("KillACheater.png"); //Beta Award

        console.log(`Found ${this.pngs.length} images!`);
        
        await this.DownloadThemAll();
    }
    
    CreateFoldersIfNotExist() {
        let folders = Stealer.tiers.map(tier => tier = `./awards/${tier}`);

        for (const folder of ["./awards", ...folders]) {
            if (!existsSync(folder)) mkdirSync(folder);
        }
    }
    
    async GetHtml() {
        let result = await fetch(Stealer.url, Stealer.options);

        return await result.text();
    }

    GetPngsOutOfHtml() {
        let urls = this.html.match(Stealer.expression);
        return urls.map(url => url.split('/').pop());
    }
    
    async DownloadThemAll() {
        let n = 0;
        let max = this.pngs.length * Stealer.tiers.length;
        let skipped = 0;

        console.log(`Starting the download of ${max} images!`);

        for (const png of this.pngs) {
            for (const tier of Stealer.tiers) {
                n++;

                let result = await fetch(`https://s.rsg.sc/sc/images/games/GTAV/multiplayer/award/${tier}/${png}`);

                let buffer = Buffer.from(await result.arrayBuffer());
                let location = `./awards/${tier}/${png}`;

                if (result.ok) {
                    console.log(`Saved: ${location}! (${n}/${max})`);
                    writeFileSync(location, buffer);
                } else {
                    console.log(`Skipping: ${location} (${n}/${max})`);
                    skipped++;
                }
            }
        }

        console.log(`Done! Downloaded: ${n-skipped},  Skipped: ${skipped}`);
    }
}