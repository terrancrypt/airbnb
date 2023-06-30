import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateRoomDto {

    @ApiProperty({
        example: "This is my room"
    })
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        example: 2
    })
    @IsNotEmpty()
    max_guests: number;

    @ApiProperty({
        example: 1
    })
    @IsNotEmpty()
    total_bedrooms: number;

    
    @ApiProperty({
        example: 1
    })
    @IsNotEmpty()
    total_beds: number;

    
    @ApiProperty({
        example: 1
    })
    @IsNotEmpty()
    total_bathrooms: number;
    
    
    @ApiProperty({
        example: "This is my room description"
    })
    @IsNotEmpty()
    description: string
    
    @ApiProperty({
        example: 350000
    })
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        example: true
    })
    @IsNotEmpty()
    has_tv: boolean;
    
    @ApiProperty({
        example: false
    })
    @IsNotEmpty()
    has_kitchen: boolean;

    @ApiProperty({
        example: true
    })
    @IsNotEmpty()
    has_air_con: boolean;

    @ApiProperty({
        example: true
    })
    @IsNotEmpty()
    has_wifi: boolean;

    @ApiProperty({
        example: false
    })
    @IsNotEmpty()
    has_washer: boolean;

    @ApiProperty({
        example: false
    })
    @IsNotEmpty()
    has_iron: boolean;

    @ApiProperty({
        example: true
    })
    @IsNotEmpty()
    has_pool: boolean;

    @ApiProperty({
        example: true
    })
    @IsNotEmpty()
    has_parking: boolean;

    @ApiProperty({
        example: false
    })
    @IsNotEmpty()
    pets_allowed: boolean;

    latitude: string;

    longtitude: string;

    @ApiProperty({
        example: "https://images.pexels.com/photos/1001965/pexels-photo-1001965.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    })
    @IsNotEmpty()
    primary_img: string;

    @ApiProperty({
        example: "123 Ngo Quyen"
    })
    @IsNotEmpty()
    street: string;

    @ApiProperty({
        example: "Quan 1"
    })
    @IsNotEmpty()
    state: string;

    @ApiProperty({
        example: "Ho Chi Minh City"
    })
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        example: "Viet Nam"
    })
    @IsNotEmpty()
    country: string;

    @ApiProperty({
        example: 2,
        description: " room type 1: Apartment, type 2: Hotel, type 3: Home"
    })
    @IsNotEmpty()
    room_type: number;

}
