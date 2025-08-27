import { Module, Global } from "@nestjs/common";
import { CloudianryProvider } from "./cloudinary.provider";

@Global()
@Module({
    providers: [CloudianryProvider],
    exports: [CloudianryProvider],
})

export class CloudinaryModule {}