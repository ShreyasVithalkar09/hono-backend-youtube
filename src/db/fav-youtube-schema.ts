import { Schema, model } from "mongoose";

export interface IFavYoutubeVideoSchema {
    title: String;
    description: String;
    thumbnail?: String;
    watched: boolean;
    youtuberName: String;
}

const FavYoutubeVideoSchema = new Schema<IFavYoutubeVideoSchema>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: "https://picsum.photos/300/200",
        required: false
    },
    watched: {
        type: Boolean,
        default: false,
        required: true
    },
    youtuberName: {
        type: String,
        required: true
    }

}, { timestamps: true})

export const FavYoutubeVideo = model('FavYoutubeVideo', FavYoutubeVideoSchema)