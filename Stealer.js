import {readFileSync, writeFileSync, existsSync, mkdirSync} from "node:fs";

export class Stealer {
    static expression = /([^"]+)\.png/g;
    static tiers = ["bronze", "silver", "gold", "platinum"];
    static url = "https://socialclub.rockstargames.com/games/gtav/career/awardsajax";
    static urlFallbackFile = "./gta5awards.html";
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
        
        console.log(`Found ${this.pngs.length} images! \n`);
        
        await this.DownloadThemAll();
    }
    
    CreateFoldersIfNotExist() {
        for (const folder of Stealer.tiers) {
            if (!existsSync(`./awards/${folder}`)) mkdirSync(`./awards/${folder}`);
        }
    }
    
    async GetHtml() {
        try {
            let result = await fetch(Stealer.url, Stealer.options);

            if (!result.ok || result.status !== 200) throw new Error("API Problem.");

            return await result.text();
        } catch (error) {
            return readFileSync(Stealer.urlFallbackFile, { encoding: 'utf8' });
        }
    }

    GetPngsOutOfHtml() {
        let urls = this.html.match(Stealer.expression);
        return urls.map(url => url.split('/').pop());
    }
    
    async DownloadThemAll() {
        for (const png of this.pngs) {
            for (const tier of Stealer.tiers) {
                let result = await fetch(`https://s.rsg.sc/sc/images/games/GTAV/multiplayer/award/${tier}/${png}`);
                //let buffer = Buffer.from(await result.blob(), "binary");
                let buffer = await result.arrayBuffer();
                let location = `./awards/${tier}/${png}`;
                
                writeFileSync(location, buffer, "binary");
                
                console.log(`Saved: ${location} \n`);
                break;
            }
            break;
        }
    }
}