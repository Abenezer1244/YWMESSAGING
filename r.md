# List Brands

This endpoint is used to list all brands associated with your organization.

List Brands API{"@context":"http://schema.org","@type":"TechArticle","headline":"List Brands API","description":"This endpoint is used to list all brands associated with your organization.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-brands","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownList Brands
GET https://api.telnyx.com/v2/10dlc/brand
This endpoint is used to list all brands associated with your organization.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `page` (Page): *Possible values:* `>= 1` *Default value:* `1`
- `recordsPerPage` (Recordsperpage): *Default value:* `10` number of records per page. maximum of 500
- `sort` (Sort): *Possible values:* [`assignedCampaignsCount` , `-assignedCampaignsCount` , `brandId` , `-brandId` , `createdAt` , `-createdAt` , `displayName` , `-displayName` , `identityStatus` , `-identityStatus` , `status` , `-status` , `tcrBrandId` , `-tcrBrandId` ] *Default value:* `-createdAt` Specifies the sort order for results. If not given, results are sorted by createdAt in descending order. *Example:* -identityStatus
- `displayName` (Displayname)
- `entityType` (Entitytype)
- `state` (State)
- `country` (Country)
- `brandId` (BrandId): Filter results by the Telnyx Brand id
- `tcrBrandId` (TCRBrandId): Filter results by the TCR Brand id

## Response

## Response Schema - records
- `records` (object[]): Array []
  - `brandId` (string): Unique identifier assigned to the brand.
  - `tcrBrandId` (string): Unique identifier assigned to the brand by the registry.
  - `entityType` (EntityType (string)): *Possible values:* [`PRIVATE_PROFIT` , `PUBLIC_PROFIT` , `NON_PROFIT` , `GOVERNMENT` ]Entity type behind the brand. This is the form of business establishment.
  - `identityStatus` (BrandIdentityStatus (string)): *Possible values:* [`VERIFIED` , `UNVERIFIED` , `SELF_DECLARED` , `VETTED_VERIFIED` ]The verification status of an active brand
  - `companyName` (string): (Required for Non-profit/private/public) Legal company name.
  - `displayName` (string): Display or marketing name of the brand.
  - `email` (string): Valid email address of brand support contact.
  - `website` (string): Brand website URL.
  - `failureReasons` (failureReasons (string)): Failure reasons for brand
  - `status` (status (string)): *Possible values:* [`OK` , `REGISTRATION_PENDING` , `REGISTRATION_FAILED` ]Status of the brand
  - `createdAt` (string): Date and time that the brand was created at.
  - `updatedAt` (string): Date and time that the brand was last updated at.
  - `assignedCampaingsCount` (integer): Number of campaigns associated with the brand
- `page` (Page (integer))
- `totalRecords` (Totalrecords (integer))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "records": [    {      "brandId": "4b206179-f731-8ab7-f19c-34e19d22ide9",      "tcrBrandId": "BBRAND1",      "entityType": "PRIVATE_PROFIT",      "identityStatus": "VERIFIED",      "companyName": "Example Company Inc.",      "displayName": "Example Company",      "email": "examplename@examplecompany.com",      "website": "www.examplecompany.com",      "failureReasons": "string",      "status": "OK",      "createdAt": "2021-03-08T17:57:48.801186",      "updatedAt": "2021-03-08T17:57:48.801186",      "assignedCampaingsCount": 2    }  ],  "page": 1,  "totalRecords": 1}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Create Brand

This endpoint is used to create a new brand. A brand is an entity created by The Campaign Registry (TCR) that represents an organization or a company. It is this entity that TCR created campaigns will be associated with. Each brand creation will entail an upfront, non-refundable $4 expense.

Create Brand API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create Brand API","description":"This endpoint is used to create a new brand. A brand is an entity created by The Campaign Registry (TCR) that represents an organization or a company. It is this entity that TCR created campaigns will be associated with. Each brand creation will entail an upfront, non-refundable $4 expense.","url":"https://developers.telnyx.com/api/messaging/10dlc/create-brand-post","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate Brand
POST https://api.telnyx.com/v2/10dlc/brand
This endpoint is used to create a new brand. A brand is an entity created by The Campaign Registry (TCR) that represents an organization or a company. It is this entity that TCR created campaigns will be associated with. Each brand creation will entail an upfront, non-refundable $4 expense.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `entityType` (EntityType (string)) [required]: *Possible values:* [`PRIVATE_PROFIT` , `PUBLIC_PROFIT` , `NON_PROFIT` , `GOVERNMENT` ]Entity type behind the brand. This is the form of business establishment.
- `displayName` (Displayname (string)) [required]: *Possible values:* `<= 100 characters` Display name, marketing name, or DBA name of the brand.
- `companyName` (Companyname (string)): *Possible values:* `<= 100 characters` (Required for Non-profit/private/public) Legal company name.
- `firstName` (Firstname (string)): *Possible values:* `<= 100 characters` First name of business contact.
- `lastName` (Lastname (string)): *Possible values:* `<= 100 characters` Last name of business contact.
- `ein` (Ein (string)): *Possible values:* `<= 20 characters` (Required for Non-profit) Government assigned corporate tax ID. EIN is 9-digits in U.S.
- `phone` (Phone (string)): *Possible values:* `<= 20 characters` Valid phone number in e.164 international format.
- `street` (Street (string)): *Possible values:* `<= 100 characters` Street number and name.
- `city` (City (string)): *Possible values:* `<= 100 characters` City name
- `state` (State (string)): *Possible values:* `<= 20 characters` State. Must be 2 letters code for United States.
- `postalCode` (Postalcode (string)): *Possible values:* `<= 10 characters` Postal codes. Use 5 digit zipcode for United States
- `country` (Country (string)) [required]: *Possible values:* `<= 2 characters` ISO2 2 characters country code. Example: US - United States
- `email` (Email (string)) [required]: *Possible values:* `<= 100 characters` Valid email address of brand support contact.
- `stockSymbol` (Stocksymbol (string)): *Possible values:* `<= 10 characters` (Required for public company) stock symbol.
- `stockExchange` (StockExchange (string)): *Possible values:* [`NONE` , `NASDAQ` , `NYSE` , `AMEX` , `AMX` , `ASX` , `B3` , `BME` , `BSE` , `FRA` , `ICEX` , `JPX` , `JSE` , `KRX` , `LON` , `NSE` , `OMX` , `SEHK` , `SSE` , `STO` , `SWX` , `SZSE` , `TSX` , `TWSE` , `VSE` ](Required for public company) stock exchange.
- `ipAddress` (Ipaddress (string)): *Possible values:* `<= 50 characters` IP address of the browser requesting to create brand identity.
- `website` (Website (string)): *Possible values:* `<= 100 characters` Brand website URL.
- `vertical` (Vertical (string)) [required]: *Possible values:* [`REAL_ESTATE` , `HEALTHCARE` , `ENERGY` , `ENTERTAINMENT` , `RETAIL` , `AGRICULTURE` , `INSURANCE` , `EDUCATION` , `HOSPITALITY` , `FINANCIAL` , `GAMBLING` , `CONSTRUCTION` , `NGO` , `MANUFACTURING` , `GOVERNMENT` , `TECHNOLOGY` , `COMMUNICATION` ]Vertical or industry segment of the brand.
- `isReseller` (Isreseller (boolean))
- `mock` (Mock (boolean)): Mock brand for testing purposes. Defaults to false.
- `mobilePhone` (Mobilephone (string)): *Possible values:* `<= 20 characters` Valid mobile phone number in e.164 international format.
- `businessContactEmail` (BusinessContactEmail (string)): Business contact email. Required if entityType is PUBLIC_PROFIT. Otherwise, it is recommended to either omit this field or set it to null.
- `webhookURL` (WebhookURL (string)): Webhook URL for brand status updates.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Webhook failover URL for brand status updates.

## Response

## Response Schema - entityType
- `entityType` (EntityType (string)) [required]: *Possible values:* [`PRIVATE_PROFIT` , `PUBLIC_PROFIT` , `NON_PROFIT` , `GOVERNMENT` ]Entity type behind the brand. This is the form of business establishment.
- `cspId` (Cspid (string)): Unique identifier assigned to the csp by the registry.
- `brandId` (Brandid (string)): Unique identifier assigned to the brand.
- `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
- `displayName` (Displayname (string)) [required]: *Possible values:* `<= 100 characters` Display or marketing name of the brand.
- `companyName` (Companyname (string)): *Possible values:* `<= 100 characters` (Required for Non-profit/private/public) Legal company name.
- `firstName` (Firstname (string)): *Possible values:* `<= 100 characters` First name of business contact.
- `lastName` (Lastname (string)): *Possible values:* `<= 100 characters` Last name of business contact.
- `ein` (Ein (string)): *Possible values:* `<= 20 characters` (Required for Non-profit) Government assigned corporate tax ID. EIN is 9-digits in U.S.
- `phone` (Phone (string)): *Possible values:* `<= 20 characters` Valid phone number in e.164 international format.
- `street` (Street (string)): *Possible values:* `<= 100 characters` Street number and name.
- `city` (City (string)): *Possible values:* `<= 100 characters` City name
- `state` (State (string)): *Possible values:* `<= 20 characters` State. Must be 2 letters code for United States.
- `postalCode` (Postalcode (string)): *Possible values:* `<= 10 characters` Postal codes. Use 5 digit zipcode for United States
- `country` (Country (string)) [required]: *Possible values:* `<= 2 characters` ISO2 2 characters country code. Example: US - United States
- `email` (Email (string)) [required]: *Possible values:* `<= 100 characters` Valid email address of brand support contact.
- `stockSymbol` (Stocksymbol (string)): *Possible values:* `<= 10 characters` (Required for public company) stock symbol.
- `stockExchange` (StockExchange (string)): *Possible values:* [`NONE` , `NASDAQ` , `NYSE` , `AMEX` , `AMX` , `ASX` , `B3` , `BME` , `BSE` , `FRA` , `ICEX` , `JPX` , `JSE` , `KRX` , `LON` , `NSE` , `OMX` , `SEHK` , `SSE` , `STO` , `SWX` , `SZSE` , `TSX` , `TWSE` , `VSE` ](Required for public company) stock exchange.
- `ipAddress` (Ipaddress (string)): *Possible values:* `<= 50 characters` IP address of the browser requesting to create brand identity.
- `website` (Website (string)): *Possible values:* `<= 100 characters` Brand website URL.
- `brandRelationship` (BrandRelationship (string)) [required]: *Possible values:* [`BASIC_ACCOUNT` , `SMALL_ACCOUNT` , `MEDIUM_ACCOUNT` , `LARGE_ACCOUNT` , `KEY_ACCOUNT` ]Brand relationship to the CSP
- `vertical` (Vertical (string)) [required]: *Possible values:* `<= 50 characters` Vertical or industry segment of the brand.
- `altBusinessId` (Altbusinessid (string)): *Possible values:* `<= 50 characters` Alternate business identifier such as DUNS, LEI, or GIIN
- `altBusinessIdType` (AltBusinessIdType (string)): *Possible values:* [`NONE` , `DUNS` , `GIIN` , `LEI` ]An enumeration.
- `universalEin` (Universalein (string)): Universal EIN of Brand, Read Only.
- `referenceId` (Referenceid (string)): Unique identifier Telnyx assigned to the brand - the brandId
- `identityStatus` (BrandIdentityStatus (string)): *Possible values:* [`VERIFIED` , `UNVERIFIED` , `SELF_DECLARED` , `VETTED_VERIFIED` ]The verification status of an active brand
- `optionalAttributes` (object)
  - `taxExemptStatus` (Taxexemptstatus (string)): The tax exempt status of the brand
- `mock` (Mock (boolean)): Mock brand for testing purposes
- `mobilePhone` (Mobilephone (string)): *Possible values:* `<= 20 characters` Valid mobile phone number in e.164 international format.
- `isReseller` (Isreseller (boolean)): Indicates whether this brand is known to be a reseller
- `webhookURL` (WebhookURL (string)): Webhook to which brand status updates are sent.
- `businessContactEmail` (BusinessContactEmail (string)): Business contact email. Required if entityType is PUBLIC_PROFIT.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which brand status updates are sent.
- `createdAt` (string): Date and time that the brand was created at.
- `updatedAt` (string): Date and time that the brand was last updated at.
- `status` (status (string)): *Possible values:* [`OK` , `REGISTRATION_PENDING` , `REGISTRATION_FAILED` ]Status of the brand
- `failureReasons` (failureReasons (string)): Failure reasons for brand

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "isReseller": false,  "mock": false,  "mobilePhone": "+12024567890",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

## Response samples
```
{  "entityType": "PRIVATE_PROFIT",  "cspId": "string",  "brandId": "4b20017f-8da9-a992-a6c0-683072fb7729",  "tcrBrandId": "BBRAND1",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "brandRelationship": "BASIC_ACCOUNT",  "vertical": "string",  "altBusinessId": "string",  "altBusinessIdType": "NONE",  "universalEin": "string",  "referenceId": "string",  "identityStatus": "VERIFIED",  "optionalAttributes": {    "taxExemptStatus": "string"  },  "mock": false,  "mobilePhone": "+12024567890",  "isReseller": false,  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "businessContactEmail": "name@example.com",  "webhookFailoverURL": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186",  "status": "OK",  "failureReasons": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Brand

Retrieve a brand by `brandId`.

Get Brand API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Brand API","description":"Retrieve a brand by `brandId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-brand","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Brand
GET https://api.telnyx.com/v2/10dlc/brand/:brandId
Retrieve a brand by `brandId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Response

## Response Schema - entityType
- `entityType` (EntityType (string)) [required]: *Possible values:* [`PRIVATE_PROFIT` , `PUBLIC_PROFIT` , `NON_PROFIT` , `GOVERNMENT` ]Entity type behind the brand. This is the form of business establishment.
- `cspId` (Cspid (string)): Unique identifier assigned to the csp by the registry.
- `brandId` (Brandid (string)): Unique identifier assigned to the brand.
- `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
- `displayName` (Displayname (string)) [required]: *Possible values:* `<= 100 characters` Display or marketing name of the brand.
- `companyName` (Companyname (string)): *Possible values:* `<= 100 characters` (Required for Non-profit/private/public) Legal company name.
- `firstName` (Firstname (string)): *Possible values:* `<= 100 characters` First name of business contact.
- `lastName` (Lastname (string)): *Possible values:* `<= 100 characters` Last name of business contact.
- `ein` (Ein (string)): *Possible values:* `<= 20 characters` (Required for Non-profit) Government assigned corporate tax ID. EIN is 9-digits in U.S.
- `phone` (Phone (string)): *Possible values:* `<= 20 characters` Valid phone number in e.164 international format.
- `street` (Street (string)): *Possible values:* `<= 100 characters` Street number and name.
- `city` (City (string)): *Possible values:* `<= 100 characters` City name
- `state` (State (string)): *Possible values:* `<= 20 characters` State. Must be 2 letters code for United States.
- `postalCode` (Postalcode (string)): *Possible values:* `<= 10 characters` Postal codes. Use 5 digit zipcode for United States
- `country` (Country (string)) [required]: *Possible values:* `<= 2 characters` ISO2 2 characters country code. Example: US - United States
- `email` (Email (string)) [required]: *Possible values:* `<= 100 characters` Valid email address of brand support contact.
- `stockSymbol` (Stocksymbol (string)): *Possible values:* `<= 10 characters` (Required for public company) stock symbol.
- `stockExchange` (StockExchange (string)): *Possible values:* [`NONE` , `NASDAQ` , `NYSE` , `AMEX` , `AMX` , `ASX` , `B3` , `BME` , `BSE` , `FRA` , `ICEX` , `JPX` , `JSE` , `KRX` , `LON` , `NSE` , `OMX` , `SEHK` , `SSE` , `STO` , `SWX` , `SZSE` , `TSX` , `TWSE` , `VSE` ](Required for public company) stock exchange.
- `ipAddress` (Ipaddress (string)): *Possible values:* `<= 50 characters` IP address of the browser requesting to create brand identity.
- `website` (Website (string)): *Possible values:* `<= 100 characters` Brand website URL.
- `brandRelationship` (BrandRelationship (string)) [required]: *Possible values:* [`BASIC_ACCOUNT` , `SMALL_ACCOUNT` , `MEDIUM_ACCOUNT` , `LARGE_ACCOUNT` , `KEY_ACCOUNT` ]Brand relationship to the CSP
- `vertical` (Vertical (string)) [required]: *Possible values:* `<= 50 characters` Vertical or industry segment of the brand.
- `altBusinessId` (Altbusinessid (string)): *Possible values:* `<= 50 characters` Alternate business identifier such as DUNS, LEI, or GIIN
- `altBusinessIdType` (AltBusinessIdType (string)): *Possible values:* [`NONE` , `DUNS` , `GIIN` , `LEI` ]An enumeration.
- `universalEin` (Universalein (string)): Universal EIN of Brand, Read Only.
- `referenceId` (Referenceid (string)): Unique identifier Telnyx assigned to the brand - the brandId
- `identityStatus` (BrandIdentityStatus (string)): *Possible values:* [`VERIFIED` , `UNVERIFIED` , `SELF_DECLARED` , `VETTED_VERIFIED` ]The verification status of an active brand
- `optionalAttributes` (object)
  - `taxExemptStatus` (Taxexemptstatus (string)): The tax exempt status of the brand
- `mock` (Mock (boolean)): Mock brand for testing purposes
- `mobilePhone` (Mobilephone (string)): *Possible values:* `<= 20 characters` Valid mobile phone number in e.164 international format.
- `isReseller` (Isreseller (boolean)): Indicates whether this brand is known to be a reseller
- `webhookURL` (WebhookURL (string)): Webhook to which brand status updates are sent.
- `businessContactEmail` (BusinessContactEmail (string)): Business contact email. Required if entityType is PUBLIC_PROFIT.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which brand status updates are sent.
- `createdAt` (string): Date and time that the brand was created at.
- `updatedAt` (string): Date and time that the brand was last updated at.
- `status` (status (string)): *Possible values:* [`OK` , `REGISTRATION_PENDING` , `REGISTRATION_FAILED` ]Status of the brand
- `failureReasons` (failureReasons (string)): Failure reasons for brand
- `assignedCampaignsCount` (AssignedCampaignsCount (number)): Number of campaigns associated with the brand

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "entityType": "PRIVATE_PROFIT",  "cspId": "string",  "brandId": "4b20017f-8da9-a992-a6c0-683072fb7729",  "tcrBrandId": "BBRAND1",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "brandRelationship": "BASIC_ACCOUNT",  "vertical": "string",  "altBusinessId": "string",  "altBusinessIdType": "NONE",  "universalEin": "string",  "referenceId": "string",  "identityStatus": "VERIFIED",  "optionalAttributes": {    "taxExemptStatus": "string"  },  "mock": false,  "mobilePhone": "+12024567890",  "isReseller": false,  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "businessContactEmail": "name@example.com",  "webhookFailoverURL": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186",  "status": "OK",  "failureReasons": "string",  "assignedCampaignsCount": 3}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```
# Update Brand

Update a brand's attributes by `brandId`.

Update Brand API{"@context":"http://schema.org","@type":"TechArticle","headline":"Update Brand API","description":"Update a brand's attributes by `brandId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/update-brand","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownUpdate Brand
PUT https://api.telnyx.com/v2/10dlc/brand/:brandId
Update a brand's attributes by `brandId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Request Body
- `entityType` (EntityType (string)) [required]: *Possible values:* [`PRIVATE_PROFIT` , `PUBLIC_PROFIT` , `NON_PROFIT` , `GOVERNMENT` ]Entity type behind the brand. This is the form of business establishment.
- `displayName` (Displayname (string)) [required]: *Possible values:* `<= 100 characters` Display or marketing name of the brand.
- `companyName` (Companyname (string)): *Possible values:* `<= 100 characters` (Required for Non-profit/private/public) Legal company name.
- `firstName` (Firstname (string)): *Possible values:* `<= 100 characters` First name of business contact.
- `lastName` (Lastname (string)): *Possible values:* `<= 100 characters` Last name of business contact.
- `ein` (Ein (string)): *Possible values:* `<= 20 characters` (Required for Non-profit) Government assigned corporate tax ID. EIN is 9-digits in U.S.
- `phone` (Phone (string)): *Possible values:* `<= 20 characters` Valid phone number in e.164 international format.
- `street` (Street (string)): *Possible values:* `<= 100 characters` Street number and name.
- `city` (City (string)): *Possible values:* `<= 100 characters` City name
- `state` (State (string)): *Possible values:* `<= 20 characters` State. Must be 2 letters code for United States.
- `postalCode` (Postalcode (string)): *Possible values:* `<= 10 characters` Postal codes. Use 5 digit zipcode for United States
- `country` (Country (string)) [required]: *Possible values:* `<= 2 characters` ISO2 2 characters country code. Example: US - United States
- `email` (Email (string)) [required]: *Possible values:* `<= 100 characters` Valid email address of brand support contact.
- `stockSymbol` (Stocksymbol (string)): *Possible values:* `<= 10 characters` (Required for public company) stock symbol.
- `stockExchange` (StockExchange (string)): *Possible values:* [`NONE` , `NASDAQ` , `NYSE` , `AMEX` , `AMX` , `ASX` , `B3` , `BME` , `BSE` , `FRA` , `ICEX` , `JPX` , `JSE` , `KRX` , `LON` , `NSE` , `OMX` , `SEHK` , `SSE` , `STO` , `SWX` , `SZSE` , `TSX` , `TWSE` , `VSE` ](Required for public company) stock exchange.
- `ipAddress` (Ipaddress (string)): *Possible values:* `<= 50 characters` IP address of the browser requesting to create brand identity.
- `website` (Website (string)): *Possible values:* `<= 100 characters` Brand website URL.
- `vertical` (Vertical (string)) [required]: *Possible values:* [`REAL_ESTATE` , `HEALTHCARE` , `ENERGY` , `ENTERTAINMENT` , `RETAIL` , `AGRICULTURE` , `INSURANCE` , `EDUCATION` , `HOSPITALITY` , `FINANCIAL` , `GAMBLING` , `CONSTRUCTION` , `NGO` , `MANUFACTURING` , `GOVERNMENT` , `TECHNOLOGY` , `COMMUNICATION` ]Vertical or industry segment of the brand.
- `altBusiness_id` (Altbusiness Id (string)): *Possible values:* `<= 50 characters` Alternate business identifier such as DUNS, LEI, or GIIN
- `altBusinessIdType` (AltBusinessIdType (string)): *Possible values:* [`NONE` , `DUNS` , `GIIN` , `LEI` ]An enumeration.
- `isReseller` (Isreseller (boolean))
- `identityStatus` (BrandIdentityStatus (string)): *Possible values:* [`VERIFIED` , `UNVERIFIED` , `SELF_DECLARED` , `VETTED_VERIFIED` ]The verification status of an active brand
- `businessContactEmail` (BusinessContactEmail (string)): Business contact email. Required if entityType will be changed to PUBLIC_PROFIT. Otherwise, it is recommended to either omit this field or set it to null.
- `webhookURL` (WebhookURL (string)): Webhook URL for brand status updates.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Webhook failover URL for brand status updates.

## Response

## Response Schema - entityType
- `entityType` (EntityType (string)) [required]: *Possible values:* [`PRIVATE_PROFIT` , `PUBLIC_PROFIT` , `NON_PROFIT` , `GOVERNMENT` ]Entity type behind the brand. This is the form of business establishment.
- `cspId` (Cspid (string)): Unique identifier assigned to the csp by the registry.
- `brandId` (Brandid (string)): Unique identifier assigned to the brand.
- `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
- `displayName` (Displayname (string)) [required]: *Possible values:* `<= 100 characters` Display or marketing name of the brand.
- `companyName` (Companyname (string)): *Possible values:* `<= 100 characters` (Required for Non-profit/private/public) Legal company name.
- `firstName` (Firstname (string)): *Possible values:* `<= 100 characters` First name of business contact.
- `lastName` (Lastname (string)): *Possible values:* `<= 100 characters` Last name of business contact.
- `ein` (Ein (string)): *Possible values:* `<= 20 characters` (Required for Non-profit) Government assigned corporate tax ID. EIN is 9-digits in U.S.
- `phone` (Phone (string)): *Possible values:* `<= 20 characters` Valid phone number in e.164 international format.
- `street` (Street (string)): *Possible values:* `<= 100 characters` Street number and name.
- `city` (City (string)): *Possible values:* `<= 100 characters` City name
- `state` (State (string)): *Possible values:* `<= 20 characters` State. Must be 2 letters code for United States.
- `postalCode` (Postalcode (string)): *Possible values:* `<= 10 characters` Postal codes. Use 5 digit zipcode for United States
- `country` (Country (string)) [required]: *Possible values:* `<= 2 characters` ISO2 2 characters country code. Example: US - United States
- `email` (Email (string)) [required]: *Possible values:* `<= 100 characters` Valid email address of brand support contact.
- `stockSymbol` (Stocksymbol (string)): *Possible values:* `<= 10 characters` (Required for public company) stock symbol.
- `stockExchange` (StockExchange (string)): *Possible values:* [`NONE` , `NASDAQ` , `NYSE` , `AMEX` , `AMX` , `ASX` , `B3` , `BME` , `BSE` , `FRA` , `ICEX` , `JPX` , `JSE` , `KRX` , `LON` , `NSE` , `OMX` , `SEHK` , `SSE` , `STO` , `SWX` , `SZSE` , `TSX` , `TWSE` , `VSE` ](Required for public company) stock exchange.
- `ipAddress` (Ipaddress (string)): *Possible values:* `<= 50 characters` IP address of the browser requesting to create brand identity.
- `website` (Website (string)): *Possible values:* `<= 100 characters` Brand website URL.
- `brandRelationship` (BrandRelationship (string)) [required]: *Possible values:* [`BASIC_ACCOUNT` , `SMALL_ACCOUNT` , `MEDIUM_ACCOUNT` , `LARGE_ACCOUNT` , `KEY_ACCOUNT` ]Brand relationship to the CSP
- `vertical` (Vertical (string)) [required]: *Possible values:* `<= 50 characters` Vertical or industry segment of the brand.
- `altBusinessId` (Altbusinessid (string)): *Possible values:* `<= 50 characters` Alternate business identifier such as DUNS, LEI, or GIIN
- `altBusinessIdType` (AltBusinessIdType (string)): *Possible values:* [`NONE` , `DUNS` , `GIIN` , `LEI` ]An enumeration.
- `universalEin` (Universalein (string)): Universal EIN of Brand, Read Only.
- `referenceId` (Referenceid (string)): Unique identifier Telnyx assigned to the brand - the brandId
- `identityStatus` (BrandIdentityStatus (string)): *Possible values:* [`VERIFIED` , `UNVERIFIED` , `SELF_DECLARED` , `VETTED_VERIFIED` ]The verification status of an active brand
- `optionalAttributes` (object)
  - `taxExemptStatus` (Taxexemptstatus (string)): The tax exempt status of the brand
- `mock` (Mock (boolean)): Mock brand for testing purposes
- `mobilePhone` (Mobilephone (string)): *Possible values:* `<= 20 characters` Valid mobile phone number in e.164 international format.
- `isReseller` (Isreseller (boolean)): Indicates whether this brand is known to be a reseller
- `webhookURL` (WebhookURL (string)): Webhook to which brand status updates are sent.
- `businessContactEmail` (BusinessContactEmail (string)): Business contact email. Required if entityType is PUBLIC_PROFIT.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which brand status updates are sent.
- `createdAt` (string): Date and time that the brand was created at.
- `updatedAt` (string): Date and time that the brand was last updated at.
- `status` (status (string)): *Possible values:* [`OK` , `REGISTRATION_PENDING` , `REGISTRATION_FAILED` ]Status of the brand
- `failureReasons` (failureReasons (string)): Failure reasons for brand

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \--data-raw '{  "entityType": "PRIVATE_PROFIT",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "vertical": "TECHNOLOGY",  "altBusiness_id": "string",  "altBusinessIdType": "NONE",  "isReseller": true,  "identityStatus": "VERIFIED",  "businessContactEmail": "name@example.com",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

## Response samples
```
{  "entityType": "PRIVATE_PROFIT",  "cspId": "string",  "brandId": "4b20017f-8da9-a992-a6c0-683072fb7729",  "tcrBrandId": "BBRAND1",  "displayName": "ABC Mobile",  "companyName": "ABC Inc.",  "firstName": "John",  "lastName": "Smith",  "ein": "111111111",  "phone": "+12024567890",  "street": "123",  "city": "New York",  "state": "NY",  "postalCode": "10001",  "country": "US",  "email": "string",  "stockSymbol": "ABC",  "stockExchange": "NASDAQ",  "ipAddress": "string",  "website": "http://www.abcmobile.com",  "brandRelationship": "BASIC_ACCOUNT",  "vertical": "string",  "altBusinessId": "string",  "altBusinessIdType": "NONE",  "universalEin": "string",  "referenceId": "string",  "identityStatus": "VERIFIED",  "optionalAttributes": {    "taxExemptStatus": "string"  },  "mock": false,  "mobilePhone": "+12024567890",  "isReseller": false,  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "businessContactEmail": "name@example.com",  "webhookFailoverURL": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186",  "status": "OK",  "failureReasons": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Delete Brand

Delete Brand. This endpoint is used to delete a brand. Note the brand cannot be deleted if it contains one or more active campaigns, the campaigns need to be inactive and at least 3 months old due to billing purposes.

Delete Brand API{"@context":"http://schema.org","@type":"TechArticle","headline":"Delete Brand API","description":"Delete Brand. This endpoint is used to delete a brand. Note the brand cannot be deleted if it contains one or more active campaigns, the campaigns need to be inactive and at least 3 months old due to billing purposes.","url":"https://developers.telnyx.com/api/messaging/10dlc/delete-brand","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownDelete Brand
DELETE https://api.telnyx.com/v2/10dlc/brand/:brandId
Delete Brand. This endpoint is used to delete a brand. Note the brand cannot be deleted if it contains one or more active campaigns, the campaigns need to be inactive and at least 3 months old due to billing purposes.
Request 
Responses 200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/brand/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Resend brand 2FA email

Resend brand 2FA email

Resend brand 2FA email API{"@context":"http://schema.org","@type":"TechArticle","headline":"Resend brand 2FA email API","description":"Resend brand 2FA email","url":"https://developers.telnyx.com/api/messaging/10dlc/resend-brand-2-fa-email","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownResend brand 2FA email
POST https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail
Request 
Responses 200: Successful ResponseTest endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Request samples
```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/brand/:brandId/2faEmail' \-H 'Authorization: Bearer <TOKEN>'
```
# Revet Brand

This operation allows you to revet the brand. However, revetting is allowed once after the successful brand registration and thereafter limited to once every 3 months.

Revet Brand API{"@context":"http://schema.org","@type":"TechArticle","headline":"Revet Brand API","description":"This operation allows you to revet the brand. However, revetting is allowed once after the successful brand registration and thereafter limited to once every 3 months.","url":"https://developers.telnyx.com/api/messaging/10dlc/revet-brand","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownRevet Brand
PUT https://api.telnyx.com/v2/10dlc/brand/:brandId/revet
This operation allows you to revet the brand. However, revetting is allowed once after the successful brand registration and thereafter limited to once every 3 months.
Request 
Responses 200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/revet' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# List External Vettings

Get list of valid external vetting record for a given brand

List External Vettings API{"@context":"http://schema.org","@type":"TechArticle","headline":"List External Vettings API","description":"Get list of valid external vetting record for a given brand","url":"https://developers.telnyx.com/api/messaging/10dlc/list-external-vettings","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownList External Vettings
GET https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting
Get list of valid external vetting record for a given brand
Request 
Responses 200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Import External Vetting Record

This operation can be used to import an external vetting record from a TCR-approved

Import External Vetting Record API{"@context":"http://schema.org","@type":"TechArticle","headline":"Import External Vetting Record API","description":"This operation can be used to import an external vetting record from a TCR-approved","url":"https://developers.telnyx.com/api/messaging/10dlc/put-external-vetting-record","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownImport External Vetting Record
PUT https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting
This operation can be used to import an external vetting record from a TCR-approved
vetting provider. If the vetting provider confirms validity of the record, it will be
saved with the brand and will be considered for future campaign qualification.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Request Body
- `evpId` (Evpid (string)) [required]: *Possible values:* `<= 10 characters` External vetting provider ID for the brand.
- `vettingId` (Vettingid (string)) [required]: Unique ID that identifies a vetting transaction performed by a vetting provider. This ID is provided by the vetting provider at time of vetting.
- `vettingToken` (Vettingtoken (string)): Required by some providers for vetting record confirmation.

## Response

## Response Schema - evpId
- `evpId` (Evpid (string)): *Possible values:* `<= 10 characters` External vetting provider ID for the brand.
- `vettingId` (vettingId (string)): Unique ID that identifies a vetting transaction performed by a vetting provider. This ID is provided by the vetting provider at time of vetting.
- `vettingToken` (vettingToken (string)): Required by some providers for vetting record confirmation.
- `vettingScore` (vettingScore (integer)): Vetting score ranging from 0-100.
- `vettingClass` (Vettingclass (string)): Identifies the vetting classification.
- `vettedDate` (vettedDate (string)): Vetting effective date. This is the date when vetting was completed, or the starting effective date in ISO 8601 format. If this date is missing, then the vetting was not complete or not valid.
- `createDate` (createDate (string)): Vetting submission date. This is the date when the vetting request is generated in ISO 8601 format.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string"}'
```

## Response samples
```
{  "evpId": "string",  "vettingId": "string",  "vettingToken": "string",  "vettingScore": 0,  "vettingClass": "string",  "vettedDate": "string",  "createDate": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Order Brand External Vetting

Order new external vetting for a brand

Order Brand External Vetting API{"@context":"http://schema.org","@type":"TechArticle","headline":"Order Brand External Vetting API","description":"Order new external vetting for a brand","url":"https://developers.telnyx.com/api/messaging/10dlc/post-order-external-vetting","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownOrder Brand External Vetting
POST https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting
Order new external vetting for a brand
Request 
Responses 200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Request Body
- `evpId` (Evpid (string)) [required]: *Possible values:* `<= 10 characters` External vetting provider ID for the brand.
- `vettingClass` (Vettingclass (string)) [required]: Identifies the vetting classification.

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/:brandId/externalVetting' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "evpId": "string",  "vettingClass": "string"}'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Brand Feedback By Id

Get feedback about a brand by ID. This endpoint can be used after creating or revetting

Get Brand Feedback By Id API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Brand Feedback By Id API","description":"Get feedback about a brand by ID. This endpoint can be used after creating or revetting","url":"https://developers.telnyx.com/api/messaging/10dlc/get-brand-feedback-by-id","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Brand Feedback By Id
GET https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId
Get feedback about a brand by ID. This endpoint can be used after creating or revetting
a brand.
Possible values for `.category[].id` :
`TAX_ID` - Data mismatch related to tax id and its associated properties.
`STOCK_SYMBOL` - Non public entity registered as a public for profit entity or
the stock information mismatch.
`GOVERNMENT_ENTITY` - Non government entity registered as a government entity.
Must be a U.S. government entity.
`NONPROFIT` - Not a recognized non-profit entity. No IRS tax-exempt status
found.
`OTHERS` - Details of the data misrepresentation if any.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `brandId` (Brandid) [required]

## Response

## Response Schema - brandId
- `brandId` (Brandid (string)) [required]: ID of the brand being queried about
- `category` (object[]) [required]: A list of reasons why brand creation/revetting didn't go as plannedArray []
  - `id` (Id (string)) [required]: One of TAX_ID, STOCK_SYMBOL, GOVERNMENT_ENTITY, NONPROFIT, and OTHERS
  - `displayName` (Displayname (string)) [required]: Human-readable version of the id field
  - `description` (Description (string)) [required]: Long-form description of the feedback with additional information
  - `fields` (string[]) [required]: List of relevant fields in the originally-submitted brand json

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/brand/feedback/:brandId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "brandId": "d88dd2aa-1bb9-4ef0-9ec8-1752b80316a5",  "category": [    {      "id": "TAX_ID",      "displayName": "Tax Id",      "description": "Tax Id does not match with the company name or business type.",      "fields": [        "ein",        "companyName",        "entityType"      ]    }  ]}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# List Campaigns

Retrieve a list of campaigns associated with a supplied `brandId`.

List Campaigns API{"@context":"http://schema.org","@type":"TechArticle","headline":"List Campaigns API","description":"Retrieve a list of campaigns associated with a supplied `brandId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaigns","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownList Campaigns
GET https://api.telnyx.com/v2/10dlc/campaign
Retrieve a list of campaigns associated with a supplied `brandId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `brandId` (Brandid) [required]
- `page` (Page): *Default value:* `1` The 1-indexed page number to get. The default value is 1.
- `recordsPerPage` (Recordsperpage): *Default value:* `10` The amount of records per page, limited to between 1 and 500 inclusive. The default value is 10.
- `sort` (Sort): *Possible values:* [`assignedPhoneNumbersCount` , `-assignedPhoneNumbersCount` , `campaignId` , `-campaignId` , `createdAt` , `-createdAt` , `status` , `-status` , `tcrCampaignId` , `-tcrCampaignId` ] *Default value:* `-createdAt` Specifies the sort order for results. If not given, results are sorted by createdAt in descending order. *Example:* -assignedPhoneNumbersCount

## Response

## Response Schema - records
- `records` (object[]) [deprecated]: Array []
  - `ageGated` (Agegated (boolean)): Age gated content in campaign.
  - `autoRenewal` (Autorenewal (boolean)): Campaign subscription auto-renewal status.
  - `billedDate` (Billeddate (string)): Campaign recent billed date.
  - `brandId` (Brandid (string)): Unique identifier assigned to the brand.
  - `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
  - `campaignId` (Campaignid (string)): Unique identifier for a campaign.
  - `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
  - `tcrCampaignId` (TcrCampaignid (string)): Unique identifier assigned to the campaign by the registry.
  - `createDate` (Createdate (string)): Unix timestamp when campaign was created.
  - `cspId` (Cspid (string)): Alphanumeric identifier of the CSP associated with this campaign.
  - `description` (Description (string)): Summary description of this campaign.
  - `directLending` (Directlending (boolean))
  - `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
  - `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
  - `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
  - `helpMessage` (Helpmessage (string)): Help message of the campaign.
  - `messageFlow` (Messageflow (string)): Message flow description.
  - `mock` (Mock (boolean)): Campaign created from mock brand. Mocked campaign cannot be shared with an upstream CNP.
  - `nextRenewalOrExpirationDate` (Nextrenewalorexpirationdate (string)): When the campaign would be due for its next renew/bill date.
  - `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
  - `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
  - `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
  - `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
  - `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
  - `referenceId` (Referenceid (string)): Caller supplied campaign reference ID. If supplied, the value must be unique across all submitted campaigns. Can be used to prevent duplicate campaign registrations.
  - `resellerId` (Resellerid (string)): Alphanumeric identifier of the reseller that you want to associate with this campaign.
  - `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
  - `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
  - `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
  - `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
  - `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
  - `status` (Status (string)): Current campaign status. Possible values: ACTIVE, EXPIRED. A newly created campaign defaults to ACTIVE status.
  - `subUsecases` (string[]): Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
  - `subscriberHelp` (Subscriberhelp (boolean)): Does campaign responds to help keyword(s)?
  - `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
  - `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
  - `termsAndConditions` (Termsandconditions (boolean)): Is terms & conditions accepted?
  - `usecase` (Usecase (string)): Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
  - `vertical` (Vertical (string)) [deprecated]: Business/industry segment of this campaign (Deprecated). Must be of defined valid types. Use /registry/enum/vertical operation to retrieve verticals available for given brand, vertical combination. This field is deprecated.
  - `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
  - `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
  - `isTMobileRegistered` (IsTMobileRegistered (boolean)): Indicates whether the campaign is registered with T-Mobile.
  - `isTMobileSuspended` (isTMobileSuspended (boolean)): Indicates whether the campaign is suspended with T-Mobile.
  - `isTMobileNumberPoolingEnabled` (isTMobileNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
  - `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
  - `submissionStatus` (submissionStatus (string)): *Possible values:* [`CREATED` , `FAILED` , `PENDING` ]Campaign submission status
  - `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
  - `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
  - `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
  - `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.
  - `assignedPhoneNumbersCount` (AssignedPhoneNumbersCount (number)): Number of phone numbers associated with the campaign
- `page` (Page (integer))
- `totalRecords` (Totalrecords (integer))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "records": [    {      "ageGated": true,      "autoRenewal": true,      "billedDate": "string",      "brandId": "d2ca9d69-641b-4131-83fa-5d0744f4c8a9",      "brandDisplayName": "ABC Mobile",      "campaignId": "823d6b1a-6ed6-41a3-9c50-c8ff41b682ba",      "tcrBrandId": "BBRAND1",      "tcrCampaignId": "CCAMP1",      "createDate": "string",      "cspId": "string",      "description": "string",      "directLending": true,      "embeddedLink": true,      "embeddedPhone": true,      "helpKeywords": "string",      "helpMessage": "string",      "messageFlow": "string",      "mock": true,      "nextRenewalOrExpirationDate": "string",      "numberPool": true,      "optinKeywords": "string",      "optinMessage": "string",      "optoutKeywords": "string",      "optoutMessage": "string",      "referenceId": "string",      "resellerId": "string",      "sample1": "string",      "sample2": "string",      "sample3": "string",      "sample4": "string",      "sample5": "string",      "status": "string",      "subUsecases": [        "string"      ],      "subscriberHelp": true,      "subscriberOptin": true,      "subscriberOptout": true,      "termsAndConditions": true,      "usecase": "string",      "webhookURL": "https://example.com/webhook",      "webhookFailoverURL": "https://example.com/failover-webhook",      "isTMobileRegistered": true,      "isTMobileSuspended": true,      "isTMobileNumberPoolingEnabled": true,      "failureReasons": "string",      "submissionStatus": "CREATED",      "campaignStatus": "TCR_ACCEPTED",      "privacyPolicyLink": "string",      "termsAndConditionsLink": "string",      "embeddedLinkSample": "string",      "assignedPhoneNumbersCount": 3    }  ],  "page": 0,  "totalRecords": 0}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get My Campaign

Retrieve campaign details by `campaignId`.

Get My Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get My Campaign API","description":"Retrieve campaign details by `campaignId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet My Campaign
GET https://api.telnyx.com/v2/10dlc/campaign/:campaignId
Retrieve campaign details by `campaignId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Response

## Response Schema - ageGated
- `ageGated` (Agegated (boolean)): Age gated content in campaign.
- `autoRenewal` (Autorenewal (boolean)): Campaign subscription auto-renewal status.
- `billedDate` (Billeddate (string)): Campaign recent billed date.
- `brandId` (Brandid (string)) [required]: Unique identifier assigned to the brand.
- `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
- `campaignId` (Campaignid (string)) [required]: Unique identifier for a campaign.
- `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
- `tcrCampaignId` (TcrCampaignid (string)): Unique identifier assigned to the campaign by the registry.
- `createDate` (Createdate (string)): Unix timestamp when campaign was created.
- `cspId` (Cspid (string)) [required]: Alphanumeric identifier of the CSP associated with this campaign.
- `description` (Description (string)) [required]: Summary description of this campaign.
- `directLending` (Directlending (boolean))
- `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
- `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
- `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
- `helpMessage` (Helpmessage (string)): Help message of the campaign.
- `messageFlow` (Messageflow (string)): Message flow description.
- `mock` (Mock (boolean)) [required]: Campaign created from mock brand. Mocked campaign cannot be shared with an upstream CNP.
- `nextRenewalOrExpirationDate` (Nextrenewalorexpirationdate (string)): When the campaign would be due for its next renew/bill date.
- `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
- `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
- `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
- `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
- `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
- `referenceId` (Referenceid (string)): Caller supplied campaign reference ID. If supplied, the value must be unique across all submitted campaigns. Can be used to prevent duplicate campaign registrations.
- `resellerId` (Resellerid (string)): Alphanumeric identifier of the reseller that you want to associate with this campaign.
- `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
- `status` (Status (string)): Current campaign status. Possible values: ACTIVE, EXPIRED. A newly created campaign defaults to ACTIVE status.
- `subUsecases` (string[]) [required]: Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
- `subscriberHelp` (Subscriberhelp (boolean)): Does campaign responds to help keyword(s)?
- `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
- `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
- `termsAndConditions` (Termsandconditions (boolean)) [required]: Is terms & conditions accepted?
- `usecase` (Usecase (string)) [required]: Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `vertical` (Vertical (string)) [deprecated]: Business/industry segment of this campaign (Deprecated). Must be of defined valid types. Use /registry/enum/vertical operation to retrieve verticals available for given brand, vertical combination. This field is deprecated.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
- `isTMobileRegistered` (IsTMobileRegistered (boolean)): Indicates whether the campaign is registered with T-Mobile.
- `isTMobileSuspended` (isTMobileSuspended (boolean)): Indicates whether the campaign is suspended with T-Mobile.
- `isTMobileNumberPoolingEnabled` (isTMobileNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
- `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
- `submissionStatus` (submissionStatus (string)): *Possible values:* [`CREATED` , `FAILED` , `PENDING` ]Campaign submission status
- `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
- `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
- `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
- `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "ageGated": true,  "autoRenewal": true,  "billedDate": "string",  "brandId": "d2ca9d69-641b-4131-83fa-5d0744f4c8a9",  "brandDisplayName": "ABC Mobile",  "campaignId": "823d6b1a-6ed6-41a3-9c50-c8ff41b682ba",  "tcrBrandId": "BBRAND1",  "tcrCampaignId": "CCAMP1",  "createDate": "string",  "cspId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mock": true,  "nextRenewalOrExpirationDate": "string",  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "status": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "termsAndConditions": true,  "usecase": "string",  "webhookURL": "https://example.com/webhook",  "webhookFailoverURL": "https://example.com/failover-webhook",  "isTMobileRegistered": true,  "isTMobileSuspended": true,  "isTMobileNumberPoolingEnabled": true,  "failureReasons": "string",  "submissionStatus": "CREATED",  "campaignStatus": "TCR_ACCEPTED",  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Update My Campaign

Update a campaign's properties by `campaignId`. **Please note:** only sample messages are editable.

Update My Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Update My Campaign API","description":"Update a campaign's properties by `campaignId`. **Please note:** only sample messages are editable.","url":"https://developers.telnyx.com/api/messaging/10dlc/update-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownUpdate My Campaign
PUT https://api.telnyx.com/v2/10dlc/campaign/:campaignId
Update a campaign's properties by `campaignId` . *Please note:* only sample messages are editable.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Request Body
- `resellerId` (Resellerid (string)): *Possible values:* `<= 8 characters` Alphanumeric identifier of the reseller that you want to associate with this campaign.
- `sample1` (Sample1 (string)): *Possible values:* `<= 255 characters` Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): *Possible values:* `<= 255 characters` Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): *Possible values:* `<= 255 characters` Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): *Possible values:* `<= 255 characters` Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): *Possible values:* `<= 255 characters` Message sample. Some campaign tiers require 5 or more message samples.
- `messageFlow` (Messageflow (string)): *Possible values:* `<= 2048 characters` Message flow description.
- `helpMessage` (Helpmessage (string)): *Possible values:* `<= 255 characters` Help message of the campaign.
- `autoRenewal` (Autorenewal (boolean)): *Default value:* `true` Help message of the campaign.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookURL (string)): Webhook failover to which campaign status updates are sent.

## Response

## Response Schema - ageGated
- `ageGated` (Agegated (boolean)): Age gated content in campaign.
- `autoRenewal` (Autorenewal (boolean)): Campaign subscription auto-renewal status.
- `billedDate` (Billeddate (string)): Campaign recent billed date.
- `brandId` (Brandid (string)) [required]: Unique identifier assigned to the brand.
- `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
- `campaignId` (Campaignid (string)) [required]: Unique identifier for a campaign.
- `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
- `tcrCampaignId` (TcrCampaignid (string)): Unique identifier assigned to the campaign by the registry.
- `createDate` (Createdate (string)): Unix timestamp when campaign was created.
- `cspId` (Cspid (string)) [required]: Alphanumeric identifier of the CSP associated with this campaign.
- `description` (Description (string)) [required]: Summary description of this campaign.
- `directLending` (Directlending (boolean))
- `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
- `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
- `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
- `helpMessage` (Helpmessage (string)): Help message of the campaign.
- `messageFlow` (Messageflow (string)): Message flow description.
- `mock` (Mock (boolean)) [required]: Campaign created from mock brand. Mocked campaign cannot be shared with an upstream CNP.
- `nextRenewalOrExpirationDate` (Nextrenewalorexpirationdate (string)): When the campaign would be due for its next renew/bill date.
- `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
- `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
- `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
- `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
- `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
- `referenceId` (Referenceid (string)): Caller supplied campaign reference ID. If supplied, the value must be unique across all submitted campaigns. Can be used to prevent duplicate campaign registrations.
- `resellerId` (Resellerid (string)): Alphanumeric identifier of the reseller that you want to associate with this campaign.
- `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
- `status` (Status (string)): Current campaign status. Possible values: ACTIVE, EXPIRED. A newly created campaign defaults to ACTIVE status.
- `subUsecases` (string[]) [required]: Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
- `subscriberHelp` (Subscriberhelp (boolean)): Does campaign responds to help keyword(s)?
- `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
- `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
- `termsAndConditions` (Termsandconditions (boolean)) [required]: Is terms & conditions accepted?
- `usecase` (Usecase (string)) [required]: Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `vertical` (Vertical (string)) [deprecated]: Business/industry segment of this campaign (Deprecated). Must be of defined valid types. Use /registry/enum/vertical operation to retrieve verticals available for given brand, vertical combination. This field is deprecated.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
- `isTMobileRegistered` (IsTMobileRegistered (boolean)): Indicates whether the campaign is registered with T-Mobile.
- `isTMobileSuspended` (isTMobileSuspended (boolean)): Indicates whether the campaign is suspended with T-Mobile.
- `isTMobileNumberPoolingEnabled` (isTMobileNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
- `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
- `submissionStatus` (submissionStatus (string)): *Possible values:* [`CREATED` , `FAILED` , `PENDING` ]Campaign submission status
- `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
- `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
- `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
- `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "messageFlow": "string",  "helpMessage": "string",  "autoRenewal": true,  "webhookURL": "string",  "webhookFailoverURL": "string"}'
```

## Response samples
```
{  "ageGated": true,  "autoRenewal": true,  "billedDate": "string",  "brandId": "d2ca9d69-641b-4131-83fa-5d0744f4c8a9",  "brandDisplayName": "ABC Mobile",  "campaignId": "823d6b1a-6ed6-41a3-9c50-c8ff41b682ba",  "tcrBrandId": "BBRAND1",  "tcrCampaignId": "CCAMP1",  "createDate": "string",  "cspId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mock": true,  "nextRenewalOrExpirationDate": "string",  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "status": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "termsAndConditions": true,  "usecase": "string",  "webhookURL": "https://example.com/webhook",  "webhookFailoverURL": "https://example.com/failover-webhook",  "isTMobileRegistered": true,  "isTMobileSuspended": true,  "isTMobileNumberPoolingEnabled": true,  "failureReasons": "string",  "submissionStatus": "CREATED",  "campaignStatus": "TCR_ACCEPTED",  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Deactivate My Campaign

Terminate a campaign. Note that once deactivated, a campaign cannot be restored.

Deactivate My Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Deactivate My Campaign API","description":"Terminate a campaign. Note that once deactivated, a campaign cannot be restored.","url":"https://developers.telnyx.com/api/messaging/10dlc/deactivate-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownDeactivate My Campaign
DELETE https://api.telnyx.com/v2/10dlc/campaign/:campaignId
Terminate a campaign. Note that once deactivated, a campaign cannot be restored.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Response

## Response Schema - time
- `time` (Time (number)) [required]
- `record_type` (Record Type (string))
- `message` (Message (string))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "time": 0,  "record_type": "string",  "message": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Submit campaign appeal for manual review

Submits an appeal for rejected native campaigns in TELNYX_FAILED or MNO_REJECTED status. The appeal is recorded for manual compliance team review and the campaign status is reset to TCR_ACCEPTED. Note: Appeal forwarding is handled manually to allow proper review before incurring upstream charges.

Submit campaign appeal for manual review API{"@context":"http://schema.org","@type":"TechArticle","headline":"Submit campaign appeal for manual review API","description":"Submits an appeal for rejected native campaigns in TELNYX_FAILED or MNO_REJECTED status. The appeal is recorded for manual compliance team review and the campaign status is reset to TCR_ACCEPTED. Note: Appeal forwarding is handled manually to allow proper review before incurring upstream charges.","url":"https://developers.telnyx.com/api/messaging/10dlc/appeal-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownSubmit campaign appeal for manual review
POST https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal
Submits an appeal for rejected native campaigns in TELNYX_FAILED or MNO_REJECTED status. The appeal is recorded for manual compliance team review and the campaign status is reset to TCR_ACCEPTED. Note: Appeal forwarding is handled manually to allow proper review before incurring upstream charges.
Request 
Responses 200: Appeal recorded successfully. Campaign status updated to TCR_ACCEPTED for manual compliance review.Schema SchemaExample (auto)Example400: Campaign not in appealable status or invalid requestSchema SchemaExample (auto)404: Campaign not foundSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (uuid) [required]: The Telnyx campaign identifier

## Request Body
Appeal request payload
- `appeal_reason` (string) [required]: Detailed explanation of why the campaign should be reconsidered and what changes have been made to address the rejection reason.

## Response

## Response Schema - appealed_at
- `appealed_at` (string<date-time>): Timestamp when the appeal was submitted

## Response Schema - code
- `code` (string) [required]
- `title` (string) [required]
- `detail` (string)
- `source` (object)
  - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
  - `parameter` (string): Indicates which query parameter caused the error.

## Response Schema - code
- `code` (string) [required]
- `title` (string) [required]
- `detail` (string)
- `source` (object)
  - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
  - `parameter` (string): Indicates which query parameter caused the error.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/appeal' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "appeal_reason": "The website has been updated to include the required privacy policy and terms of service."}'
```

## Response samples
```
{  "appealed_at": "2025-08-06T15:30:45.123456"}
```

```
{  "code": "string",  "title": "string",  "detail": "string",  "source": {    "pointer": "string",    "parameter": "string"  }}
```

```
{  "code": "string",  "title": "string",  "detail": "string",  "source": {    "pointer": "string",    "parameter": "string"  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get My Campaign Operation Status

Retrieve campaign's operation status at MNO level.

Get My Campaign Operation Status API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get My Campaign Operation Status API","description":"Retrieve campaign's operation status at MNO level.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaign-operation-status","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet My Campaign Operation Status
GET https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus
Retrieve campaign's operation status at MNO level.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Response

## Response Schema - object
- `object` (object)

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/operationStatus' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get My Osr Campaign Attributes

Get My Osr Campaign Attributes

Get My Osr Campaign Attributes API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get My Osr Campaign Attributes API","description":"Get My Osr Campaign Attributes","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaign-osr-attributes","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet My Osr Campaign Attributes
GET https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Response

## Response Schema - object
- `object` (object)

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/osr/attributes' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Campaign Cost

Get Campaign Cost

Get Campaign Cost API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Campaign Cost API","description":"Get Campaign Cost","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaign-cost","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Campaign Cost
GET https://api.telnyx.com/v2/10dlc/campaign/usecase/cost
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `usecase` (Usecase) [required]

## Response

## Response Schema - campaignUsecase
- `campaignUsecase` (Campaignusecase (string)) [required]
- `monthlyCost` (Monthlycost (string)) [required]
- `upFrontCost` (Upfrontcost (string)) [required]
- `description` (Description (string)) [required]

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/usecase/cost' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "campaignUsecase": "string",  "monthlyCost": "string",  "upFrontCost": "string",  "description": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Submit Campaign

Before creating a campaign, use the [Qualify By Usecase endpoint](https://developers.telnyx.com/api/messaging/10dlc/get-usecase-qualification) to ensure that the brand you want to assign a new campaign to is qualified for the desired use case of that campaign. **Please note:** After campaign creation, you'll only be able to edit the campaign's sample messages. Creating a campaign will entail an upfront, non-refundable three month's cost that will depend on the campaign's use case ([see 10DLC Costs section for details](https://developers.telnyx.com/docs/messaging/10dlc/concepts#10dlc-costs)).

Submit Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Submit Campaign API","description":"Before creating a campaign, use the [Qualify By Usecase endpoint](https://developers.telnyx.com/api/messaging/10dlc/get-usecase-qualification) to ensure that the brand you want to assign a new campaign to is qualified for the desired use case of that campaign. **Please note:** After campaign creation, you'll only be able to edit the campaign's sample messages. Creating a campaign will entail an upfront, non-refundable three month's cost that will depend on the campaign's use case ([see 10DLC Costs section for details](https://developers.telnyx.com/docs/messaging/10dlc/concepts#10dlc-costs)).","url":"https://developers.telnyx.com/api/messaging/10dlc/post-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownSubmit Campaign
POST https://api.telnyx.com/v2/10dlc/campaignBuilder
Before creating a campaign, use the Qualify By Usecase endpoint to ensure that the brand you want to assign a new campaign to is qualified for the desired use case of that campaign. *Please note:* After campaign creation, you'll only be able to edit the campaign's sample messages. Creating a campaign will entail an upfront, non-refundable three month's cost that will depend on the campaign's use case (see 10DLC Costs section for details).
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Request Body
- `ageGated` (Agegated (boolean)): Age gated message content in campaign.
- `autoRenewal` (Autorenewal (boolean)): Campaign subscription auto-renewal option. If set to true, then campaign will automatically renewal at end of billing cycle.
- `brandId` (Brandid (string)) [required]: Alphanumeric identifier of the brand associated with this campaign.
- `description` (Description (string)) [required]: Summary description of this campaign.
- `directLending` (Directlending (boolean)): Direct lending or loan arrangement
- `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
- `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
- `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
- `helpMessage` (Helpmessage (string)): Help message of the campaign.
- `messageFlow` (Messageflow (string)): Message flow description.
- `mnoIds` (integer[]): Submit campaign to given list of MNOs by MNO's network ID. Default is all MNOs if no value provided.
- `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
- `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
- `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
- `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
- `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
- `referenceId` (Referenceid (string)): Caller supplied campaign reference ID. If supplied, the value must be unique across all submitted campaigns. Can be used to prevent duplicate campaign registrations.
- `resellerId` (Resellerid (string)): Alphanumeric identifier of the reseller that you want to associate with this campaign.
- `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
- `subUsecases` (string[]): Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
- `subscriberHelp` (Subscriberhelp (boolean)): Does campaign responds to help keyword(s)?
- `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
- `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
- `tag` (string[]): Tags to be set on the Campaign.
- `termsAndConditions` (Termsandconditions (boolean)): Is terms and conditions accepted?
- `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
- `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
- `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.
- `usecase` (Usecase (string)) [required]: Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.

## Response

## Response Schema
anyOfobject objectTelnyxCampaign_CSP
- `[item]` (object)
- `ageGated` (Agegated (boolean)): Age gated content in campaign.
- `autoRenewal` (Autorenewal (boolean)): Campaign subscription auto-renewal status.
- `billedDate` (Billeddate (string)): Campaign recent billed date.
- `brandId` (Brandid (string)) [required]: Unique identifier assigned to the brand.
- `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
- `campaignId` (Campaignid (string)) [required]: Unique identifier for a campaign.
- `tcrBrandId` (TcrBrandid (string)): Unique identifier assigned to the brand by the registry.
- `tcrCampaignId` (TcrCampaignid (string)): Unique identifier assigned to the campaign by the registry.
- `createDate` (Createdate (string)): Unix timestamp when campaign was created.
- `cspId` (Cspid (string)) [required]: Alphanumeric identifier of the CSP associated with this campaign.
- `description` (Description (string)) [required]: Summary description of this campaign.
- `directLending` (Directlending (boolean))
- `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
- `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
- `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
- `helpMessage` (Helpmessage (string)): Help message of the campaign.
- `messageFlow` (Messageflow (string)): Message flow description.
- `mock` (Mock (boolean)) [required]: Campaign created from mock brand. Mocked campaign cannot be shared with an upstream CNP.
- `nextRenewalOrExpirationDate` (Nextrenewalorexpirationdate (string)): When the campaign would be due for its next renew/bill date.
- `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
- `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
- `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
- `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
- `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
- `referenceId` (Referenceid (string)): Caller supplied campaign reference ID. If supplied, the value must be unique across all submitted campaigns. Can be used to prevent duplicate campaign registrations.
- `resellerId` (Resellerid (string)): Alphanumeric identifier of the reseller that you want to associate with this campaign.
- `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
- `status` (Status (string)): Current campaign status. Possible values: ACTIVE, EXPIRED. A newly created campaign defaults to ACTIVE status.
- `subUsecases` (string[]) [required]: Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
- `subscriberHelp` (Subscriberhelp (boolean)): Does campaign responds to help keyword(s)?
- `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
- `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
- `termsAndConditions` (Termsandconditions (boolean)) [required]: Is terms & conditions accepted?
- `usecase` (Usecase (string)) [required]: Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `vertical` (Vertical (string)) [deprecated]: Business/industry segment of this campaign (Deprecated). Must be of defined valid types. Use /registry/enum/vertical operation to retrieve verticals available for given brand, vertical combination. This field is deprecated.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
- `isTMobileRegistered` (IsTMobileRegistered (boolean)): Indicates whether the campaign is registered with T-Mobile.
- `isTMobileSuspended` (isTMobileSuspended (boolean)): Indicates whether the campaign is suspended with T-Mobile.
- `isTMobileNumberPoolingEnabled` (isTMobileNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
- `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
- `submissionStatus` (submissionStatus (string)): *Possible values:* [`CREATED` , `FAILED` , `PENDING` ]Campaign submission status
- `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
- `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
- `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
- `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "ageGated": true,  "autoRenewal": true,  "brandId": "string",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedPhone": true,  "helpKeywords": "string",  "helpMessage": "string",  "messageFlow": "string",  "mnoIds": [    0  ],  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "referenceId": "string",  "resellerId": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberHelp": true,  "subscriberOptin": true,  "subscriberOptout": true,  "tag": [    "string"  ],  "termsAndConditions": true,  "privacyPolicyLink": "string",  "termsAndConditionsLink": "string",  "embeddedLinkSample": "string",  "usecase": "string",  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/93711262-23e5-4048-a966-c0b2a16d5963"}'
```

## Response samples
```
{}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Qualify By Usecase

This endpoint allows you to see whether or not the supplied brand is suitable for your desired campaign use case.

Qualify By Usecase API{"@context":"http://schema.org","@type":"TechArticle","headline":"Qualify By Usecase API","description":"This endpoint allows you to see whether or not the supplied brand is suitable for your desired campaign use case.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-usecase-qualification","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownQualify By Usecase
GET https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase
This endpoint allows you to see whether or not the supplied brand is suitable for your desired campaign use case.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `usecase` (Usecase) [required]
- `brandId` (Brandid) [required]

## Response

## Response Schema - annualFee
- `annualFee` (Annualfee (number)): Campaign annual subscription fee
- `maxSubUsecases` (Maxsubusecases (integer)): Maximum number of sub-usecases declaration required.
- `minSubUsecases` (Minsubusecases (integer)): Minimum number of sub-usecases declaration required.
- `mnoMetadata` (object): Map of usecase metadata for each MNO. Key is the network ID of the MNO (e.g. 10017), Value is the mno metadata for the usecase.
  - `property name*` (any): Map of usecase metadata for each MNO. Key is the network ID of the MNO (e.g. 10017), Value is the mno metadata for the usecase.
- `monthlyFee` (Monthlyfee (number)): Campaign monthly subscription fee
- `quarterlyFee` (Quarterlyfee (number)): Campaign quarterly subscription fee
- `usecase` (Usecase (string)): Campaign usecase

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaignBuilder/brand/:brandId/usecase/:usecase' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "annualFee": 0,  "maxSubUsecases": 0,  "minSubUsecases": 0,  "mnoMetadata": {},  "monthlyFee": 0,  "quarterlyFee": 0,  "usecase": "string"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Accept Shared Campaign

Manually accept a campaign shared with Telnyx

Accept Shared Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Accept Shared Campaign API","description":"Manually accept a campaign shared with Telnyx","url":"https://developers.telnyx.com/api/messaging/10dlc/accept-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownAccept Shared Campaign
POST https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId
Manually accept a campaign shared with Telnyx
Request 
Responses 200: Successful ResponseSchema Schema422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]: *Possible values:* Value must match regular expression `^C[A-Z0-9]{5,8}$` TCR's ID for the campaign to import

## Response

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X POST 'https://api.telnyx.com/v2/10dlc/campaign/acceptSharing/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Campaign Mno Metadata

Get the campaign metadata for each MNO it was submitted to.

Get Campaign Mno Metadata API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Campaign Mno Metadata API","description":"Get the campaign metadata for each MNO it was submitted to.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaign-mno-metadata","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Campaign Mno Metadata
GET https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata
Get the campaign metadata for each MNO it was submitted to.
Request 
Responses 200: Successful Response. It constains a map of usecase metadata for each MNO. The key is the network ID of the MNO (e.g. 10017), the value is the mno metadata for the usecase. The metadata may also include some MNO specific fields.Schema SchemaExample (auto)default: Unexpected ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]: ID of the campaign in question

## Response

## Response Schema - 10999
- `10999` (object) [required]
  - `qualify` (boolean) [required]
  - `mno` (string) [required]
  - `noEmbeddedLink` (boolean) [required]
  - `reqSubscriberHelp` (boolean) [required]
  - `reqSubscriberOptout` (boolean) [required]
  - `mnoReview` (boolean) [required]
  - `noEmbeddedPhone` (boolean) [required]
  - `mnoSupport` (boolean) [required]
  - `reqSubscriberOptin` (boolean) [required]
  - `minMsgSamples` (integer) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/mnoMetadata' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "10999": {    "qualify": true,    "mno": "string",    "noEmbeddedLink": true,    "reqSubscriberHelp": true,    "reqSubscriberOptout": true,    "mnoReview": true,    "noEmbeddedPhone": true,    "mnoSupport": true,    "reqSubscriberOptin": true,    "minMsgSamples": 1  }}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Get Sharing Status

Get Sharing Status

Get Sharing Status API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Sharing Status API","description":"Get Sharing Status","url":"https://developers.telnyx.com/api/messaging/10dlc/get-campaign-sharing-status","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Sharing Status
GET https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]: ID of the campaign in question

## Response

## Response Schema - sharedByMe
- `sharedByMe` (object)
  - `downstreamCnpId` (Downstreamcnpid (string))
  - `sharedDate` (Shareddate (string))
  - `sharingStatus` (Sharingstatus (string))
  - `statusDate` (Statusdate (string))
  - `upstreamCnpId` (Upstreamcnpid (string))
- `sharedWithMe` (object)
  - `downstreamCnpId` (Downstreamcnpid (string))
  - `sharedDate` (Shareddate (string))
  - `sharingStatus` (Sharingstatus (string))
  - `statusDate` (Statusdate (string))
  - `upstreamCnpId` (Upstreamcnpid (string))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/campaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "sharedByMe": {    "downstreamCnpId": "string",    "sharedDate": "string",    "sharingStatus": "string",    "statusDate": "string",    "upstreamCnpId": "string"  },  "sharedWithMe": {    "downstreamCnpId": "string",    "sharedDate": "string",    "sharingStatus": "string",    "statusDate": "string",    "upstreamCnpId": "string"  }}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Retrieve All Phone Number Campaigns

Retrieve All Phone Number Campaigns

Retrieve All Phone Number Campaigns API{"@context":"http://schema.org","@type":"TechArticle","headline":"Retrieve All Phone Number Campaigns API","description":"Retrieve All Phone Number Campaigns","url":"https://developers.telnyx.com/api/messaging/10dlc/get-all-phone-number-campaigns","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownRetrieve All Phone Number Campaigns
GET https://api.telnyx.com/v2/10dlc/phone_number_campaigns
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `recordsPerPage` (Recordsperpage): *Default value:* `20`
- `page` (Page): *Default value:* `1`
- `filter` (object): Consolidated filter parameter (deepObject style). Originally: filter[telnyx_campaign_id], filter[telnyx_brand_id], filter[tcr_campaign_id], filter[tcr_brand_id]
- `sort` (Sort): *Possible values:* [`assignmentStatus` , `-assignmentStatus` , `createdAt` , `-createdAt` , `phoneNumber` , `-phoneNumber` ] *Default value:* `-createdAt` Specifies the sort order for results. If not given, results are sorted by createdAt in descending order. *Example:* -phoneNumber

## Response

## Response Schema - records
- `records` (object[]) [required]: Array []
  - `phoneNumber` (Phonenumber (string)) [required]
  - `brandId` (BrandId (string)): Brand ID. Empty if the number is associated to a shared campaign.
  - `tcrBrandId` (TcrBrandId (string)): TCR's alphanumeric ID for the brand.
  - `campaignId` (Campaignid (string)) [required]: For shared campaigns, this is the TCR campaign ID, otherwise it is the campaign ID
  - `tcrCampaignId` (TcrCampaignid (string)): TCR's alphanumeric ID for the campaign.
  - `telnyxCampaignId` (Telnyxcampaignid (string)): Campaign ID. Empty if the number is associated to a shared campaign.
  - `assignmentStatus` (AssignmentStatus (string)): *Possible values:* [`FAILED_ASSIGNMENT` , `PENDING_ASSIGNMENT` , `ASSIGNED` , `PENDING_UNASSIGNMENT` , `FAILED_UNASSIGNMENT` ]The assignment status of the number.
  - `failureReasons` (string): Extra info about a failure to assign/unassign a number. Relevant only if the assignmentStatus is either FAILED_ASSIGNMENT or FAILED_UNASSIGNMENT
  - `createdAt` (Createdat (string)) [required]
  - `updatedAt` (Updatedat (string)) [required]
- `page` (Page (integer)) [required]
- `totalRecords` (Totalrecords (integer)) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "records": [    {      "phoneNumber": "+18005550199",      "brandId": "7ba705b7-22af-493f-addc-ac04b7ca071c",      "tcrBrandId": "BBRAND1",      "campaignId": "string",      "tcrCampaignId": "CCAMPA1",      "telnyxCampaignId": "3008dd9f-66d7-40e0-bf23-bf2d8d1a96ba",      "assignmentStatus": "ASSIGNED",      "failureReasons": "string",      "createdAt": "2021-03-08T17:57:48.801186",      "updatedAt": "2021-03-08T17:57:48.801186"    }  ],  "page": 0,  "totalRecords": 0}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Create New Phone Number Campaign

Create New Phone Number Campaign

Create New Phone Number Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create New Phone Number Campaign API","description":"Create New Phone Number Campaign","url":"https://developers.telnyx.com/api/messaging/10dlc/create-phone-number-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate New Phone Number Campaign
POST https://api.telnyx.com/v2/10dlc/phone_number_campaigns
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Request Body
- `phoneNumber` (Phonenumber (string)) [required]: The phone number you want to link to a specified campaign.
- `campaignId` (Campaignid (string)) [required]: The ID of the campaign you want to link to the specified phone number.

## Response

## Response Schema - phoneNumber
- `phoneNumber` (Phonenumber (string)) [required]
- `brandId` (BrandId (string)): Brand ID. Empty if the number is associated to a shared campaign.
- `tcrBrandId` (TcrBrandId (string)): TCR's alphanumeric ID for the brand.
- `campaignId` (Campaignid (string)) [required]: For shared campaigns, this is the TCR campaign ID, otherwise it is the campaign ID
- `tcrCampaignId` (TcrCampaignid (string)): TCR's alphanumeric ID for the campaign.
- `telnyxCampaignId` (Telnyxcampaignid (string)): Campaign ID. Empty if the number is associated to a shared campaign.
- `assignmentStatus` (AssignmentStatus (string)): *Possible values:* [`FAILED_ASSIGNMENT` , `PENDING_ASSIGNMENT` , `ASSIGNED` , `PENDING_UNASSIGNMENT` , `FAILED_UNASSIGNMENT` ]The assignment status of the number.
- `failureReasons` (string): Extra info about a failure to assign/unassign a number. Relevant only if the assignmentStatus is either FAILED_ASSIGNMENT or FAILED_UNASSIGNMENT
- `createdAt` (Createdat (string)) [required]
- `updatedAt` (Updatedat (string)) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

## Response samples
```
{  "phoneNumber": "+18005550199",  "brandId": "7ba705b7-22af-493f-addc-ac04b7ca071c",  "tcrBrandId": "BBRAND1",  "campaignId": "string",  "tcrCampaignId": "CCAMPA1",  "telnyxCampaignId": "3008dd9f-66d7-40e0-bf23-bf2d8d1a96ba",  "assignmentStatus": "ASSIGNED",  "failureReasons": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186"}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Get Single Phone Number Campaign

Retrieve an individual phone number/campaign assignment by `phoneNumber`.

Get Single Phone Number Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Single Phone Number Campaign API","description":"Retrieve an individual phone number/campaign assignment by `phoneNumber`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-single-phone-number-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Single Phone Number Campaign
GET https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber
Retrieve an individual phone number/campaign assignment by `phoneNumber` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `phoneNumber` (Phonenumber) [required]

## Response

## Response Schema - phoneNumber
- `phoneNumber` (Phonenumber (string)) [required]
- `brandId` (BrandId (string)): Brand ID. Empty if the number is associated to a shared campaign.
- `tcrBrandId` (TcrBrandId (string)): TCR's alphanumeric ID for the brand.
- `campaignId` (Campaignid (string)) [required]: For shared campaigns, this is the TCR campaign ID, otherwise it is the campaign ID
- `tcrCampaignId` (TcrCampaignid (string)): TCR's alphanumeric ID for the campaign.
- `telnyxCampaignId` (Telnyxcampaignid (string)): Campaign ID. Empty if the number is associated to a shared campaign.
- `assignmentStatus` (AssignmentStatus (string)): *Possible values:* [`FAILED_ASSIGNMENT` , `PENDING_ASSIGNMENT` , `ASSIGNED` , `PENDING_UNASSIGNMENT` , `FAILED_UNASSIGNMENT` ]The assignment status of the number.
- `failureReasons` (string): Extra info about a failure to assign/unassign a number. Relevant only if the assignmentStatus is either FAILED_ASSIGNMENT or FAILED_UNASSIGNMENT
- `createdAt` (Createdat (string)) [required]
- `updatedAt` (Updatedat (string)) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "phoneNumber": "+18005550199",  "brandId": "7ba705b7-22af-493f-addc-ac04b7ca071c",  "tcrBrandId": "BBRAND1",  "campaignId": "string",  "tcrCampaignId": "CCAMPA1",  "telnyxCampaignId": "3008dd9f-66d7-40e0-bf23-bf2d8d1a96ba",  "assignmentStatus": "ASSIGNED",  "failureReasons": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186"}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Create New Phone Number Campaign

Create New Phone Number Campaign

Create New Phone Number Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Create New Phone Number Campaign API","description":"Create New Phone Number Campaign","url":"https://developers.telnyx.com/api/messaging/10dlc/put-phone-number-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownCreate New Phone Number Campaign
PUT https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `phoneNumber` (Phonenumber) [required]

## Request Body
- `phoneNumber` (Phonenumber (string)) [required]: The phone number you want to link to a specified campaign.
- `campaignId` (Campaignid (string)) [required]: The ID of the campaign you want to link to the specified phone number.

## Response

## Response Schema - phoneNumber
- `phoneNumber` (Phonenumber (string)) [required]
- `brandId` (BrandId (string)): Brand ID. Empty if the number is associated to a shared campaign.
- `tcrBrandId` (TcrBrandId (string)): TCR's alphanumeric ID for the brand.
- `campaignId` (Campaignid (string)) [required]: For shared campaigns, this is the TCR campaign ID, otherwise it is the campaign ID
- `tcrCampaignId` (TcrCampaignid (string)): TCR's alphanumeric ID for the campaign.
- `telnyxCampaignId` (Telnyxcampaignid (string)): Campaign ID. Empty if the number is associated to a shared campaign.
- `assignmentStatus` (AssignmentStatus (string)): *Possible values:* [`FAILED_ASSIGNMENT` , `PENDING_ASSIGNMENT` , `ASSIGNED` , `PENDING_UNASSIGNMENT` , `FAILED_UNASSIGNMENT` ]The assignment status of the number.
- `failureReasons` (string): Extra info about a failure to assign/unassign a number. Relevant only if the assignmentStatus is either FAILED_ASSIGNMENT or FAILED_UNASSIGNMENT
- `createdAt` (Createdat (string)) [required]
- `updatedAt` (Updatedat (string)) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L -X PUT 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "phoneNumber": "+18005550199",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

## Response samples
```
{  "phoneNumber": "+18005550199",  "brandId": "7ba705b7-22af-493f-addc-ac04b7ca071c",  "tcrBrandId": "BBRAND1",  "campaignId": "string",  "tcrCampaignId": "CCAMPA1",  "telnyxCampaignId": "3008dd9f-66d7-40e0-bf23-bf2d8d1a96ba",  "assignmentStatus": "ASSIGNED",  "failureReasons": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186"}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Delete Phone Number Campaign

This endpoint allows you to remove a campaign assignment from the supplied `phoneNumber`.

Delete Phone Number Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Delete Phone Number Campaign API","description":"This endpoint allows you to remove a campaign assignment from the supplied `phoneNumber`.","url":"https://developers.telnyx.com/api/messaging/10dlc/delete-phone-number-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownDelete Phone Number Campaign
DELETE https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber
This endpoint allows you to remove a campaign assignment from the supplied `phoneNumber` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `phoneNumber` (Phonenumber) [required]

## Response

## Response Schema - phoneNumber
- `phoneNumber` (Phonenumber (string)) [required]
- `brandId` (BrandId (string)): Brand ID. Empty if the number is associated to a shared campaign.
- `tcrBrandId` (TcrBrandId (string)): TCR's alphanumeric ID for the brand.
- `campaignId` (Campaignid (string)) [required]: For shared campaigns, this is the TCR campaign ID, otherwise it is the campaign ID
- `tcrCampaignId` (TcrCampaignid (string)): TCR's alphanumeric ID for the campaign.
- `telnyxCampaignId` (Telnyxcampaignid (string)): Campaign ID. Empty if the number is associated to a shared campaign.
- `assignmentStatus` (AssignmentStatus (string)): *Possible values:* [`FAILED_ASSIGNMENT` , `PENDING_ASSIGNMENT` , `ASSIGNED` , `PENDING_UNASSIGNMENT` , `FAILED_UNASSIGNMENT` ]The assignment status of the number.
- `failureReasons` (string): Extra info about a failure to assign/unassign a number. Relevant only if the assignmentStatus is either FAILED_ASSIGNMENT or FAILED_UNASSIGNMENT
- `createdAt` (Createdat (string)) [required]
- `updatedAt` (Updatedat (string)) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L -X DELETE 'https://api.telnyx.com/v2/10dlc/phone_number_campaigns/:phoneNumber' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "phoneNumber": "+18005550199",  "brandId": "7ba705b7-22af-493f-addc-ac04b7ca071c",  "tcrBrandId": "BBRAND1",  "campaignId": "string",  "tcrCampaignId": "CCAMPA1",  "telnyxCampaignId": "3008dd9f-66d7-40e0-bf23-bf2d8d1a96ba",  "assignmentStatus": "ASSIGNED",  "failureReasons": "string",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186"}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Assign Messaging Profile To Campaign

This endpoint allows you to link all phone numbers associated with a Messaging Profile to a campaign. **Please note:** if you want to assign phone numbers to a campaign that you did not create with Telnyx 10DLC services, this endpoint allows that provided that you've shared the campaign with Telnyx. In this case, only provide the parameter, `tcrCampaignId`, and not `campaignId`. In all other cases (where the campaign you're assigning was created with Telnyx 10DLC services), only provide `campaignId`, not `tcrCampaignId`.

Assign Messaging Profile To Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Assign Messaging Profile To Campaign API","description":"This endpoint allows you to link all phone numbers associated with a Messaging Profile to a campaign. **Please note:** if you want to assign phone numbers to a campaign that you did not create with Telnyx 10DLC services, this endpoint allows that provided that you've shared the campaign with Telnyx. In this case, only provide the parameter, `tcrCampaignId`, and not `campaignId`. In all other cases (where the campaign you're assigning was created with Telnyx 10DLC services), only provide `campaignId`, not `tcrCampaignId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/post-assign-messaging-profile-to-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownAssign Messaging Profile To Campaign
POST https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile
This endpoint allows you to link all phone numbers associated with a Messaging Profile to a campaign. *Please note:* if you want to assign phone numbers to a campaign that you did not create with Telnyx 10DLC services, this endpoint allows that provided that you've shared the campaign with Telnyx. In this case, only provide the parameter, `tcrCampaignId` , and not `campaignId` . In all other cases (where the campaign you're assigning was created with Telnyx 10DLC services), only provide `campaignId` , not `tcrCampaignId` .
Request 
Responses 202: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Request Body
- `messagingProfileId` (Messagingprofileid (string)) [required]: The ID of the messaging profile that you want to link to the specified campaign.
- `tcrCampaignId` (Tcrcampaignid (string)): The TCR ID of the shared campaign you want to link to the specified messaging profile (for campaigns not created using Telnyx 10DLC services only). If you supply this ID in the request, do not also include a campaignId.
- `campaignId` (Campaignid (string)): The ID of the campaign you want to link to the specified messaging profile. If you supply this ID in the request, do not also include a tcrCampaignId.

## Response

## Response Schema - messagingProfileId
anyOfAssignProfileToCampaignResponse AssignProfileToCampaignResponseSettingsDataErrorMessage
- `messagingProfileId` (Messagingprofileid (string)) [required]: The ID of the messaging profile that you want to link to the specified campaign.
- `tcrCampaignId` (Tcrcampaignid (string)): The TCR ID of the shared campaign you want to link to the specified messaging profile (for campaigns not created using Telnyx 10DLC services only). If you supply this ID in the request, do not also include a campaignId.
- `campaignId` (Campaignid (string)): The ID of the campaign you want to link to the specified messaging profile. If you supply this ID in the request, do not also include a tcrCampaignId.
- `taskId` (Taskid (string)) [required]: The ID of the task associated with assigning a messaging profile to a campaign.
- `message` (Message (string)) [required]

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j"}'
```

## Response samples
```
{  "messagingProfileId": "4001767e-ce0f-4cae-9d5f-0d5e636e7809",  "tcrCampaignId": "CWZTFH1",  "campaignId": "4b300178-131c-d902-d54e-72d90ba1620j",  "taskId": "667a80f8-b0a9-49d0-b9ab-a7a1bcc45086"}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Get Assignment Task Status

Check the status of the task associated with assigning all phone numbers on a messaging profile to a campaign by `taskId`.

Get Assignment Task Status API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Assignment Task Status API","description":"Check the status of the task associated with assigning all phone numbers on a messaging profile to a campaign by `taskId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-assignment-task-status","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Assignment Task Status
GET https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId
Check the status of the task associated with assigning all phone numbers on a messaging profile to a campaign by `taskId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `taskId` (Taskid) [required]

## Response

## Response Schema - taskId
- `taskId` (Taskid (string)) [required]
- `status` (TaskStatus (string)) [required]: *Possible values:* [`pending` , `processing` , `completed` , `failed` ]The status of the task associated with assigning a messaging profile to a campaign.
- `createdAt` (string<date-time>)
- `updatedAt` (string<date-time>)

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "taskId": "string",  "status": "pending",  "createdAt": "2024-07-29T15:51:28.071Z",  "updatedAt": "2024-07-29T15:51:28.071Z"}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# Get Phone Number Status

Check the status of the individual phone number/campaign assignments associated with the supplied `taskId`.

Get Phone Number Status API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Phone Number Status API","description":"Check the status of the individual phone number/campaign assignments associated with the supplied `taskId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-phone-number-status","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Phone Number Status
GET https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers
Check the status of the individual phone number/campaign assignments associated with the supplied `taskId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)default: Unexpected errorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `taskId` (Taskid) [required]

## Query Parameters
- `recordsPerPage` (Recordsperpage): *Default value:* `20`
- `page` (Page): *Default value:* `1`

## Response

## Response Schema - records
- `records` (object[]) [required]: Array []
  - `taskId` (Taskid (string)) [required]: The ID of the task associated with the phone number.
  - `phoneNumber` (Phonenumber (string)) [required]: The phone number that the status is being checked for.
  - `status` (Status (string)) [required]: The status of the associated phone number assignment.

## Response Schema - errors
- `errors` (object[]) [required]: Array []
  - `code` (string) [required]
  - `title` (string) [required]
  - `detail` (string)
  - `source` (object)
    - `pointer` (string): JSON pointer (RFC6901) to the offending entity.
    - `parameter` (string): Indicates which query parameter caused the error.

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/phoneNumberAssignmentByProfile/:taskId/phoneNumbers' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "records": [    {      "taskId": "667a80f8-b0a9-49d0-b9ab-a7a1bcc45086",      "phoneNumber": "+12024567890",      "status": "pending"    }  ]}
```

```
{  "errors": [    {      "code": "string",      "title": "string",      "detail": "string",      "source": {        "pointer": "string",        "parameter": "string"      }    }  ]}
```

# List Shared Campaigns

Retrieve all partner campaigns you have shared to Telnyx in a paginated fashion.

List Shared Campaigns API{"@context":"http://schema.org","@type":"TechArticle","headline":"List Shared Campaigns API","description":"Retrieve all partner campaigns you have shared to Telnyx in a paginated fashion.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-shared-campaigns","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownList Shared Campaigns
GET https://api.telnyx.com/v2/10dlc/partner_campaigns
Retrieve all partner campaigns you have shared to Telnyx in a paginated fashion.
This endpoint is currently limited to only returning shared campaigns that Telnyx has accepted. In other words, shared but pending campaigns are currently omitted from the response from this endpoint.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `page` (Page): *Default value:* `1` The 1-indexed page number to get. The default value is 1.
- `recordsPerPage` (Recordsperpage): *Default value:* `10` The amount of records per page, limited to between 1 and 500 inclusive. The default value is 10.
- `sort` (Sort): *Possible values:* [`assignedPhoneNumbersCount` , `-assignedPhoneNumbersCount` , `brandDisplayName` , `-brandDisplayName` , `tcrBrandId` , `-tcrBranId` , `tcrCampaignId` , `-tcrCampaignId` , `createdAt` , `-createdAt` , `campaignStatus` , `-campaignStatus` ] *Default value:* `-createdAt` Specifies the sort order for results. If not given, results are sorted by createdAt in descending order. *Example:* -assignedPhoneNumbersCount

## Response

## Response Schema - records
- `records` (object[]) [required]: Array []
  - `ageGated` (AgeGated (boolean)): Age gated content in campaign.
  - `assignedPhoneNumbersCount` (AssignedPhoneNumbersCount (number)): Number of phone numbers associated with the campaign
  - `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
  - `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
  - `description` (Description (string)): Summary description of this campaign.
  - `directLending` (Directlending (boolean)): Direct lending or loan arrangement.
  - `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
  - `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.
  - `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
  - `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
  - `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
  - `helpMessage` (Helpmessage (string)): Help message of the campaign.
  - `isNumberPoolingEnabled` (isNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
  - `messageFlow` (Messageflow (string)): Message flow description.
  - `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
  - `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
  - `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
  - `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
  - `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
  - `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
  - `usecase` (Usecase (string)): Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
  - `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
  - `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
  - `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
  - `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
  - `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
  - `subUsecases` (string[]): Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
  - `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
  - `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
  - `tcrBrandId` (TcrBrandid (string)) [required]: Unique identifier assigned to the brand by the registry.
  - `tcrCampaignId` (TcrCampaignid (string)) [required]: Unique identifier assigned to the campaign by the registry.
  - `termsAndConditions` (Termsandconditions (boolean)): Is terms & conditions accepted?
  - `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
  - `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
  - `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
  - `createdAt` (string): Date and time that the brand was created at.
  - `updatedAt` (string): Date and time that the brand was last updated at.
- `page` (Page (integer))
- `totalRecords` (Totalrecords (integer))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "records": [    {      "ageGated": true,      "assignedPhoneNumbersCount": 3,      "brandDisplayName": "ABC Mobile",      "campaignStatus": "TCR_ACCEPTED",      "description": "string",      "directLending": true,      "embeddedLink": true,      "embeddedLinkSample": "string",      "embeddedPhone": true,      "failureReasons": "string",      "helpKeywords": "string",      "helpMessage": "string",      "isNumberPoolingEnabled": true,      "messageFlow": "string",      "numberPool": true,      "optinKeywords": "string",      "optinMessage": "string",      "optoutKeywords": "string",      "optoutMessage": "string",      "privacyPolicyLink": "string",      "usecase": "string",      "sample1": "string",      "sample2": "string",      "sample3": "string",      "sample4": "string",      "sample5": "string",      "subUsecases": [        "string"      ],      "subscriberOptin": true,      "subscriberOptout": true,      "tcrBrandId": "BBRAND1",      "tcrCampaignId": "CCAMP1",      "termsAndConditions": true,      "termsAndConditionsLink": "string",      "webhookURL": "https://example.com/webhook",      "webhookFailoverURL": "https://example.com/failover-webhook",      "createdAt": "2021-03-08T17:57:48.801186",      "updatedAt": "2021-03-08T17:57:48.801186"    }  ],  "page": 0,  "totalRecords": 0}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Single Shared Campaign

Retrieve campaign details by `campaignId`.

Get Single Shared Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Single Shared Campaign API","description":"Retrieve campaign details by `campaignId`.","url":"https://developers.telnyx.com/api/messaging/10dlc/get-shared-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Single Shared Campaign
GET https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId
Retrieve campaign details by `campaignId` .
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Response

## Response Schema - ageGated
- `ageGated` (AgeGated (boolean)): Age gated content in campaign.
- `assignedPhoneNumbersCount` (AssignedPhoneNumbersCount (number)): Number of phone numbers associated with the campaign
- `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
- `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
- `description` (Description (string)): Summary description of this campaign.
- `directLending` (Directlending (boolean)): Direct lending or loan arrangement.
- `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
- `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.
- `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
- `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
- `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
- `helpMessage` (Helpmessage (string)): Help message of the campaign.
- `isNumberPoolingEnabled` (isNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
- `messageFlow` (Messageflow (string)): Message flow description.
- `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
- `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
- `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
- `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
- `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
- `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
- `usecase` (Usecase (string)): Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
- `subUsecases` (string[]): Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
- `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
- `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
- `tcrBrandId` (TcrBrandid (string)) [required]: Unique identifier assigned to the brand by the registry.
- `tcrCampaignId` (TcrCampaignid (string)) [required]: Unique identifier assigned to the campaign by the registry.
- `termsAndConditions` (Termsandconditions (boolean)): Is terms & conditions accepted?
- `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
- `createdAt` (string): Date and time that the brand was created at.
- `updatedAt` (string): Date and time that the brand was last updated at.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "ageGated": true,  "assignedPhoneNumbersCount": 3,  "brandDisplayName": "ABC Mobile",  "campaignStatus": "TCR_ACCEPTED",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedLinkSample": "string",  "embeddedPhone": true,  "failureReasons": "string",  "helpKeywords": "string",  "helpMessage": "string",  "isNumberPoolingEnabled": true,  "messageFlow": "string",  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "privacyPolicyLink": "string",  "usecase": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberOptin": true,  "subscriberOptout": true,  "tcrBrandId": "BBRAND1",  "tcrCampaignId": "CCAMP1",  "termsAndConditions": true,  "termsAndConditionsLink": "string",  "webhookURL": "https://example.com/webhook",  "webhookFailoverURL": "https://example.com/failover-webhook",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Update Single Shared Campaign

Update campaign details by `campaignId`. **Please note:** Only webhook urls are editable.

Update Single Shared Campaign API{"@context":"http://schema.org","@type":"TechArticle","headline":"Update Single Shared Campaign API","description":"Update campaign details by `campaignId`. **Please note:** Only webhook urls are editable.","url":"https://developers.telnyx.com/api/messaging/10dlc/update-shared-campaign","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownUpdate Single Shared Campaign
PATCH https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId
Update campaign details by `campaignId` . *Please note:* Only webhook urls are editable.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]

## Request Body
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookURL (string)): Webhook failover to which campaign status updates are sent.

## Response

## Response Schema - ageGated
- `ageGated` (AgeGated (boolean)): Age gated content in campaign.
- `assignedPhoneNumbersCount` (AssignedPhoneNumbersCount (number)): Number of phone numbers associated with the campaign
- `brandDisplayName` (Branddisplayname (string)): Display or marketing name of the brand.
- `campaignStatus` (campaignStatus (string)): *Possible values:* [`TCR_PENDING` , `TCR_SUSPENDED` , `TCR_EXPIRED` , `TCR_ACCEPTED` , `TCR_FAILED` , `TELNYX_ACCEPTED` , `TELNYX_FAILED` , `MNO_PENDING` , `MNO_ACCEPTED` , `MNO_REJECTED` , `MNO_PROVISIONED` , `MNO_PROVISIONING_FAILED` ]Campaign status
- `description` (Description (string)): Summary description of this campaign.
- `directLending` (Directlending (boolean)): Direct lending or loan arrangement.
- `embeddedLink` (Embeddedlink (boolean)): Does message generated by the campaign include URL link in SMS?
- `embeddedLinkSample` (EmbeddedLinkSample (string)): Sample of an embedded link that will be sent to subscribers.
- `embeddedPhone` (Embeddedphone (boolean)): Does message generated by the campaign include phone number in SMS?
- `failureReasons` (failureReasons (string)): Failure reasons if campaign submission failed
- `helpKeywords` (Helpkeywords (string)): Subscriber help keywords. Multiple keywords are comma separated without space.
- `helpMessage` (Helpmessage (string)): Help message of the campaign.
- `isNumberPoolingEnabled` (isNumberPoolingEnabled (boolean)): Indicates whether the campaign has a T-Mobile number pool ID associated with it.
- `messageFlow` (Messageflow (string)): Message flow description.
- `numberPool` (Numberpool (boolean)): Does campaign utilize pool of phone numbers?
- `optinKeywords` (Optinkeywords (string)): Subscriber opt-in keywords. Multiple keywords are comma separated without space.
- `optinMessage` (Optinmessage (string)): Subscriber opt-in message.
- `optoutKeywords` (Optoutkeywords (string)): Subscriber opt-out keywords. Multiple keywords are comma separated without space.
- `optoutMessage` (Optoutmessage (string)): Subscriber opt-out message.
- `privacyPolicyLink` (PrivacyPolicyLink (string)): Link to the campaign's privacy policy.
- `usecase` (Usecase (string)): Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `sample1` (Sample1 (string)): Message sample. Some campaign tiers require 1 or more message samples.
- `sample2` (Sample2 (string)): Message sample. Some campaign tiers require 2 or more message samples.
- `sample3` (Sample3 (string)): Message sample. Some campaign tiers require 3 or more message samples.
- `sample4` (Sample4 (string)): Message sample. Some campaign tiers require 4 or more message samples.
- `sample5` (Sample5 (string)): Message sample. Some campaign tiers require 5 or more message samples.
- `subUsecases` (string[]): Campaign sub-usecases. Must be of defined valid sub-usecase types. Use /registry/enum/usecase operation to retrieve list of valid sub-usecases
- `subscriberOptin` (Subscriberoptin (boolean)): Does campaign require subscriber to opt-in before SMS is sent to subscriber?
- `subscriberOptout` (Subscriberoptout (boolean)): Does campaign support subscriber opt-out keyword(s)?
- `tcrBrandId` (TcrBrandid (string)) [required]: Unique identifier assigned to the brand by the registry.
- `tcrCampaignId` (TcrCampaignid (string)) [required]: Unique identifier assigned to the campaign by the registry.
- `termsAndConditions` (Termsandconditions (boolean)): Is terms & conditions accepted?
- `termsAndConditionsLink` (TermsAndConditionsLink (string)): Link to the campaign's terms and conditions.
- `webhookURL` (WebhookURL (string)): Webhook to which campaign status updates are sent.
- `webhookFailoverURL` (WebhookFailoverURL (string)): Failover webhook to which campaign status updates are sent.
- `createdAt` (string): Date and time that the brand was created at.
- `updatedAt` (string): Date and time that the brand was last updated at.

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

```
curl -L -X PATCH 'https://api.telnyx.com/v2/10dlc/partner_campaigns/:campaignId' \-H 'Content-Type: application/json' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>' \-d '{  "webhookURL": "https://webhook.com/67ea78a8-9f32-4d04-b62d-f9502e8e5f93",  "webhookFailoverURL": "https://webhook.com/9010a453-4df8-4be6-a551-1070892888d6"}'
```

## Response samples
```
{  "ageGated": true,  "assignedPhoneNumbersCount": 3,  "brandDisplayName": "ABC Mobile",  "campaignStatus": "TCR_ACCEPTED",  "description": "string",  "directLending": true,  "embeddedLink": true,  "embeddedLinkSample": "string",  "embeddedPhone": true,  "failureReasons": "string",  "helpKeywords": "string",  "helpMessage": "string",  "isNumberPoolingEnabled": true,  "messageFlow": "string",  "numberPool": true,  "optinKeywords": "string",  "optinMessage": "string",  "optoutKeywords": "string",  "optoutMessage": "string",  "privacyPolicyLink": "string",  "usecase": "string",  "sample1": "string",  "sample2": "string",  "sample3": "string",  "sample4": "string",  "sample5": "string",  "subUsecases": [    "string"  ],  "subscriberOptin": true,  "subscriberOptout": true,  "tcrBrandId": "BBRAND1",  "tcrCampaignId": "CCAMP1",  "termsAndConditions": true,  "termsAndConditionsLink": "string",  "webhookURL": "https://example.com/webhook",  "webhookFailoverURL": "https://example.com/failover-webhook",  "createdAt": "2021-03-08T17:57:48.801186",  "updatedAt": "2021-03-08T17:57:48.801186"}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Sharing Status

Get Sharing Status

Get Sharing Status API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Sharing Status API","description":"Get Sharing Status","url":"https://developers.telnyx.com/api/messaging/10dlc/get-partner-campaign-sharing-status","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Sharing Status
GET https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Path Parameters
- `campaignId` (Campaignid) [required]: ID of the campaign in question

## Response

## Response Schema - property name*
- `property name*` (CampaignSharingStatus)
  - `downstreamCnpId` (Downstreamcnpid (string))
  - `sharedDate` (Shareddate (string))
  - `sharingStatus` (Sharingstatus (string))
  - `statusDate` (Statusdate (string))
  - `upstreamCnpId` (Upstreamcnpid (string))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/:campaignId/sharing' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Get Partner Campaigns Shared By User

Get all partner campaigns you have shared to Telnyx in a paginated fashion

Get Partner Campaigns Shared By User API{"@context":"http://schema.org","@type":"TechArticle","headline":"Get Partner Campaigns Shared By User API","description":"Get all partner campaigns you have shared to Telnyx in a paginated fashion","url":"https://developers.telnyx.com/api/messaging/10dlc/get-partner-campaigns-shared-by-user","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownGet Partner Campaigns Shared By User
GET https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe
Get all partner campaigns you have shared to Telnyx in a paginated fashion
This endpoint is currently limited to only returning shared campaigns that Telnyx
has accepted. In other words, shared but pending campaigns are currently omitted
from the response from this endpoint.
Request 
Responses 200: Successful ResponseSchema SchemaExample (auto)422: Validation ErrorSchema SchemaExample (auto)Test endpoint

## Query Parameters
- `page` (Page): *Default value:* `1` The 1-indexed page number to get. The default value is 1.
- `recordsPerPage` (Recordsperpage): *Default value:* `10` The amount of records per page, limited to between 1 and 500 inclusive. The default value is 10.

## Response

## Response Schema - page
- `page` (Page (integer))
- `records` (object[]) [required]: Array []
  - `brandId` (Brandid (string)) [required]: Alphanumeric identifier of the brand associated with this campaign.
  - `campaignId` (Campaignid (string)) [required]: Alphanumeric identifier assigned by the registry for a campaign. This identifier is required by the NetNumber OSR SMS enabling process of 10DLC.
  - `createDate` (Createdate (string)): Unix timestamp when campaign was created.
  - `status` (Status (string)): Current campaign status. Possible values: ACTIVE, EXPIRED. A newly created campaign defaults to ACTIVE status.
  - `usecase` (Usecase (string)) [required]: Campaign usecase. Must be of defined valid types. Use /registry/enum/usecase operation to retrieve usecases available for given brand.
- `totalRecords` (Totalrecords (integer))

## Response Schema - detail
- `detail` (object[]) [required]: Array []
  - `loc` (object[]) [required]: Array [anyOfstring stringinteger]
    - `[item]` (string)
    - `[item]` (integer)
  - `msg` (Message (string)) [required]
  - `type` (Error Type (string)) [required]

## Request samples
```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

```
curl -L 'https://api.telnyx.com/v2/10dlc/partnerCampaign/sharedByMe' \-H 'Accept: application/json' \-H 'Authorization: Bearer <TOKEN>'
```

## Response samples
```
{  "page": 0,  "records": [    {      "brandId": "string",      "campaignId": "string",      "createDate": "string",      "status": "string",      "usecase": "string"    }  ],  "totalRecords": 0}
```

```
{  "detail": [    {      "loc": [        "string",        0      ],      "msg": "string",      "type": "string"    }  ]}
```

# Errors

You can download it as a json file by going here.

Errors API{"@context":"http://schema.org","@type":"TechArticle","headline":"Errors API","description":"You can download it as a json file by going here.","url":"https://developers.telnyx.com/api/errors/","author":{"@type":"Organization","name":"Telnyx"},"publisher":{"@type":"Organization","name":"Telnyx","url":"https://www.telnyx.com","logo":{"@type":"ImageObject","url":"https://developers.telnyx.com/img/logo.svg","width":270,"height":108}}}Copy for LLMView as MarkdownAPI Error Messages
You can download it as a json file by going here.
CodeTitleDetail10001Inactive phone numberThe phone number is inactive.10002Invalid phone numberThe phone number is invalid.10003Invalid URLThe URL provided was invalid, malformed, or too long. URLs can be a maximum of 2000 characters.10004Missing required parameterA required parameter was missing.10005Resource not foundThe requested resource or URL could not be found.10006Invalid IDThe resource ID provided was invalid.10007Unexpected errorAn unexpected error occured.10008Request timeoutThe request timed out.10009Authentication failedThe required authentication headers were either invalid or not included in the request.10010Authorization failedYou do not have permission to perform the requested action on the specified resource or resources.10011Too many requestsYou have exceeded the maximum number of allowed requests.10012Duplicate resourceResource is a duplicate.10013Missing associationOne of the associated fields does not exist.10014Unsupported Media TypeThe request failed because the server does not support the media type.10015Bad RequestThe request failed because it was not well-formed.10016Phone number must be in +E.164 formatThe specified phone number parameter must be in +E.164 format.10017Associated resource does not existThe requested parameter is invalid as the associated resource does not exist.10018Invalid sort directionThe 'sort_direction' parameter must have a value of either 'asc' or 'desc'.10019Invalid email addressThe 'email' parameter is not a valid email address.10020Invalid resource typeThe requested parameter must be of type 'string'10021Resource in useThe resource can not be removed as it is still in use.10022One or more invalid IDsOne or more of the IDs provided were invalid.10023Invalid JSONThe supplied JSON is invalid.10024Unsupported Content-TypeMust encode request as 'application/x-www-form-urlencoded' or 'application/json'10025String length out of rangeThe string length provided for the indicated field was outside the allowed range. The field must be between `{min}` and `{max}` characters long, but was `{actual}` .10026Invalid parameter typeThe parameter must be of type `{expected_type}` , but received type `{received_type}` 10027Unprocessable EntityThe server understood the syntax of the request but was unable to process the instructions.10028Character encoding errorThe request body was not able to be decoded.10029Expected JSON Content-TypeMust encode request as 'application/json'10030Method not allowedThe URL is valid, but the method is not allowed.10031Invalid request filterThe request filter filter[`{filter}` ] is invalid.10032Invalid enumerated valueThe value must be one of `{enumerated_values}` 10033Value outside of rangeThe value is outside of allowed range `{min_allow}` to `{max_allow}` 10034Expected URL-encoded form Content-TypeMust encode request as 'application/x-www-form-urlencoded'10035Resource lockedThe resource has been locked. Contact Telnyx support.10036Resource is being processedThis resource is in ongoing processing and it can't be interacted with. Please, wait for its operation to finish and retry later.10037Service unavailableService is unavailable.10038Feature not permittedThis feature is not permitted at this account level. Refer to https://telnyx.com/upgrade.10039Feature limitedA limit for this feature has been reached at this account level. See https://telnyx.com/upgrade for options.10700Invalid caller dataThe CNAM caller data provided is invalid.20000Invalid resource groupsThe resource groups provided are invalid.20001Invalid API Key secretThe secret provided is invalid.20002API Key revokedThe API Key provided is not active.20003API Key forbiddenThe API Key provided is forbidden.20004Invalid permission groupsThe permission groups provided are invalid.20005Invalid userThe user provided is invalid.20006Expired access tokenThe access token provided is expired.20007Invalid permission groupsThe permission groups provided must be a subset of the API Key's.20008Invalid API KeyThe API Key provided is invalid.20009Invalid userThe user provided does not exist.20010Invalid invitationThe invitation provided does not exist.20011API Key in useThe API Key can not be revoked while assigned to a portal user.20012Account inactiveThe request cannot be fulfilled because your account has been deactivated. It may be out of funds.20013Account blockedYour account has been blocked. Please contact Telnyx support.20014Account unverifiedYou have not completed the verifications required to perform this action. Check the 'verifications' tab under 'account' on the portal for more information.20015Feature not enabledThe `{feature}` feature is not enabled on your account.20016Account not level 1 verifiedLevel 1 account verification is required to perform this action. Check the 'verifications' tab under 'account' on the portal for more information.20017Account not level 2 verifiedLevel 2 account verification is required to perform this action. Check the 'verifications' tab under 'account' on the portal for more information.20100Insufficient FundsYou do not have enough funds to perform this action.20200Invalid addressThe address provided is invalid.20201Invalid country codeThe country code provided is invalid.20202Invalid localityThe locality provided is invalid.20203Invalid neighborhoodThe neighborhood provided is invalid.20204Invalid administrative areaThe administrative area provided is invalid.20205Invalid postal codeThe postal code provided is invalid.20206Invalid boroughThe borough provided is invalid.20207Invalid street addressThe street address provided is invalid.20208Invalid street address house numberThe street address house number provided is invalid.20209Invalid extended addressThe extended address provided is invalid.40001Not routableThe destination number is either a landline or a non-routable wireless number.40002Blocked as spam - temporaryThe message was flagged by a SPAM filter and was not delivered. This is a temporary condition.40003Blocked as spam - permanentThe message was flagged by a SPAM filter and was not delivered. The originating phone number is permanently blocked.40004Rejected by destinationThe recipient server is rejecting the message for an unknown reason.40005Message expired during transmissionThe message expired before it could be fully delivered to the recipient.40006Recipient server unavailableThe recipient server is unavailable or not responding.40007Loop detectedInfinite loop detected.40008UndeliverableThe recipient carrier did not accept the message.40009Invalid message bodyThe message body was invalid.40010Not 10DLC registeredThe sending number is not 10DLC-registered but is required to be by the carrier.40011Too many requestsExceeded upstream rate limit. As a result the message was flagged by a SPAM filter and was not delivered. This is a temporary condition.40012Invalid messaging destination numberThe destination phone number was deemed invalid by the carrier.40013Invalid messaging source numberThe source phone number was deemed invalid by the carrier.40014Message expired in queueThe message was not sent by Telnyx because its validity period expired.40015Blocked as spam - internalThe message was flagged by an internal Telnyx SPAM filter.40016T-Mobile 10DLC Sending Limit ReachedYou have exceeded T-Mobile's allotted throughput limits for the campaign associated to this phone number40017AT&T 10DLC Spam Message RejectedAT&T has rejected your message for spam on the 10DLC route40018AT&T 10DLC Sending Limit ReachedYou have exceeded AT&T's allotted throughput limits for the campaign associated to this phone number40019AT&T 10DLC Invalid Tag DataAT&T has rejected your message because the tagging information is incorrect40020Blocked as potentially artificial inflation of trafficSending of 2FA traffic has been blocked for 24 hours.40100Number not messaging enabled.The number is not currently messaging enabled.40150Toll free number not in registryMessaging cannot be enabled for this number because the number is not in the voice registry.40151Message enablement pending with other providerMessaging is in the process of being enabled with another messaging provider.40152Invalid OSR parameterOne of the parameters sent to the OSR was missing or invalid.40153Cannot access OSRTelnyx is not authorized to access the OSR.40154Unauthorized NNIDTelnyx is not authorized to use this NNID.40155LOA requiredAn LOA is required to text message enable this number.40156Unauthorized property name/valueTelnyx is not authorized to provision this property name or property value.40157Temporarily blockedTelnyx is temporarily unable to make changes to the OSR.40158Delete failedThe record was not found or the NNID was invalid so it could not be deleted.40159Unknown OSR errorAn error occurred while updating the OSR.40300Blocked due to STOP messageMessages cannot be sent from `{src}` to `{dst}` due to an existing block rule.40301Unsupported message type for the 'to' addressSending messages from `{src}` to `{dst}` is currently unsupported.40302Message too largeThe SMS message would be divided into `{parts}` parts. The maximum is `{max_parts}` .40303Message not foundThe message with ID `{id}` was not found.40304Invalid combination of message content argumentsThe message must contain exclusively 'body' for SMS, or 'subject' and/or 'media_urls' for MMS40305Invalid 'from' addressThe 'from' address should be string containing a valid phone number or alphanumeric sender ID associated with the sending messaging profile.40306Alpha sender not configuredThe messaging profile doesn't have an associated alphanumeric sender ID.40307Alpha sender mismatchThe specified alphanumeric sender ID `{provided_sender}` does not match the one configured on the profile `{expected_sender}` 40308Invalid 'from' address for MMSMMS can only be sent from US long code numbers and MMS-configured short codes40309Invalid destination regionThe region `{region}` for the destination `{dst}` is not included in the messaging profile's whitelisted destinations.40310Invalid 'to' addressThe 'to' address should be a single valid number.40311Invalid messaging profile secretThe provided X-Profile-Secret header was invalid.40312Messaging profile is disabledThe specified messaging profile `{id}` is disabled.40313Missing messaging profile secretThe X-Profile-Secret header is missing.40314Messaging disabled on accountMessaging has been disabled on your account. Contact Telnyx support.40315Unhealthy 'from' addressSending number `{src}` (with success rate `{success}` and spam rejection rate `{spam}` ) did not pass the health check.40316No content provided for messageThe message has no content. Either 'text' and/or 'media_urls' must be provided in the request.40317Invalid MMS contentMMS can only contain up to 10 items (URLs provided) and the total size must be less than 1 MB.40318Message queue fullMessage queue is full. Wait before resending.40319Incompatible message type for the 'to' addressSending messages from `{src}` to `{dst}` is not possible.40320Temporarily unusable 'from' addressThe sending number `{src}` is in a temporarily unusable or pending state.40321No usable numbers on messaging profileNumber Pool is not enabled, or it is unable to select a usable number on the messaging profile.40322Blocked due to contentMessage contains invalid content.40323Messaging activation failedCould not enable messaging on the number.40324Messaging product type change failedCould not change product types for the number.40325Invalid alphanumeric sender IDThe specified alphanumeric sender ID value is invalid.40326Cannot assign alphanumeric sender IDThe alphanumeric sender ID could not be assigned to the messaging profile.40327Invalid DomainThe domain provided is not listed as a valid domain to be used with URL Shortener40328SMS exceeds recommended sizeThe SMS message would be divided into `{parts}` parts. Messages over `{max_parts}` should be sent by MMS or by adding auto_detect=False.40329Tollfree number is not verifiedTry verifying the number if you haven't already; otherwise double check that verification succeeded.40330Tollfree number is not provisionedThis TFN is not yet fully provisioned for messaging.40331Missing whitelisted destinationsMessaging profile is missing whitelisted destinations.40332Brand cannot be deletedBrand cannot be deleted due to an associated active campaign.40333Messaging profile spend limit reachedRequest refused because this would incur cost above the spend limit configured on the messaging profile.41000WhatsApp Error`{code}` - `{title}` 50000VRF still deployedThe VRF can not be removed as it is still deployed to one or more sites50001VRF not deployedThe VRF is not deployed at this site50002VRF already deployedThe VRF is already deployed at this site50003Invalid IP addressThis is not a valid IP address50004Private IP address not permittedPrivate IP addresses are not permitted50005Invalid CIDR blockThis is not a valid CIDR block50006Private CIDR block not permittedPrivate CIDR blocks are not permitted50007CIDR block too largeCIDR blocks are limited to /`{prefixlen}` and higher50008Can not delete IP from sourceCan not delete IP from source `{source}` 55001Credential expired, can not create token.The credential used to create the token has expired.65001Invalid Room IDThe provided room_id was not valid.70000Consumption reached data limitThe consumption reached the defined data limit. Please, update the SIM card group data limit.70001There aren't enough available SIM cardsInsufficient inventory to satisfy order request.70002Invalid data formatThe provided data attribute was invalid.70003Mobile operators' preferences priorities are out of sequenceThe mobile operators' preferences priorities should be in an ascending order starting by 0.70004OTA update in progressSIM card network preferences can't be defined when a previous OTA update is still in progress.70005Could not delete SIM card groupThe SIM card group associated with the provided ID can not be deleted because there are SIM cards associated with the SIM card group.70006Could not delete default SIM card groupThe SIM card group associated with the provided ID can not be deleted because it is the default SIM card group on your account.70007SIM card doesn't have a SIM card groupA SIM card cannot be enabled unless it's associated with a SIM card group.70008Public IPs are unavailable at this timeThere aren't any public IPs available at this time. Please contact Telnyx support for more information.75000Webhook delivery errorThe webhook was not successful75001Could not resolve nameUnable to resolve the webhook URL domain name75002Could not connect to hostCould not connect to the webhook host75003Certificate misconfigurationWebhook host certificate could not be verified75004Expired certificateThe webhook host certificate has expired75005Certificate name mismatchThe domain name on the certificate does not match the domain in the URL75006Untrusted certificate rootThe certificate is not signed by a trusted authority75299Webhook host returned a non-200 HTTP 2XXThe server returned an HTTP 2XX code, but was not the expected HTTP 20075300Webhook host returned HTTP 3XXThe server returned an HTTP 3XX redirect75400Webhook host returned HTTP 400The server returned an HTTP 40075404Webhook host returned HTTP 404The server returned an HTTP 40475499Webhook host returned HTTP 4XXThe server returned an HTTP 4XX error75500Webhook host returned HTTP 500The server returned an HTTP 50075599Webhook host returned HTTP 5XXThe server returned an HTTP 5XX error80000Wrong accountOne or more numbers you are attempting to port do not belong to the specified account.80001Inactive numberOne or more numbers you are attempting to port are not active on the account. Only active numbers may be ported.80002Wrong providerTelnyx is not the service provider for one or more of the numbers you are attempting to port.80003Pending orderOne or more numbers are already part of another port request.80004Invalid desired due dateThe desired due date is not within the allowable window. Please review the porting guidelines.80005Invalid passcode or pinThe passcode or PIN provided does not match what has been assigned to the number.80006Invalid PONThe Purchase Order Number (PON) provided is invalid. It must be between 3 and 20 characters and may not contain special characters.80007FOC expiredThe firm order committment has expired since the number was not ported on the agreed upon due date.80008Missing LOAA valid LOA (Letter of Authorization) is required to port numbers.80009Illegible LOAThe LOA (Letter of Authorization) provided was illegible or unable to be viewed.80010Expired LOAThe LOA (Letter of Authorization) provided has expired and is no longer valid.80011Invalid SPIDThe service provider ID (SPID) provided was not recognized.80012Unsuported carrierThe functionality requested is not supported with the specified carrier.80013Invalid countryAutomated porting is only supported in the US and Canada.80014Service address mismatchThe service address provided does not match the address on the account.80015Stranded phone numbersThe BTN/ATN on the account is being ported out which would leave stranded any remaining phone numbers.80016No CSR data availableA CSR could not be retrieved because the data submitted did not match closely enough with the data on file with the carrier.80017Invalid service provider typeThe 'service_provider_type' parameter must be one of either 'Telnyx' or 'Peerless'.80018Invalid FOC dateThe 'foc_date' parameter must be an ISO8601 datetime selected from the available FOC dates.80019Invalid service provider IDThe 'service_provider_id' parameter must be the ID of an existing service provider.80020Invalid subscription statusThe 'subscription_status' parameter is required and must have a value of 'pending', 'concurred', 'timer_expired', 'conflict', 'activated', 'cancel_pending', 'cancelled', 'disconnect_pending', 'disconnected' or 'failed'80021Invalid porting optionThe 'porting_option' parameter is required and must have a value of 'full' or 'partial'.80022Invalid document typeThe 'document_type' parameter must have value of 'loa', 'csr', 'invoice' or 'other'.80023Invalid value for rate centersThe 'rate_centers' parameter must be a list of valid rate centers.80024Record could not be deletedThe sub_request could not be deleted as it has associated phone_numbers.80100Subscription version not createdThe new service provider did not create an NPAC subscription version.80101Subscription version does not matchThe new service provider created an NPAC subscription version that does not match the record Telnyx created.80200Duplicate phone numbers foundDuplicate phone numbers were found in the request.80201Phone number limit exceededToo many phone numbers were specified for an LSR preorder.80400Invalid credentialsThe Port PS account credentials were invalid.80401Too many phone numbersThere is a maximum of 1000 lookups per request.85000Must search phone number via search API firstYou must search for the number through our API before attempting to purchase.85001Phone numbers not availableThe numbers you are trying to order are no longer available for purchase.85002Phone numbers update not allowed on this orderYou are trying to update a number that is not in this order.85003Regulatory requirements already satisfiedRegulatory requirements cannot be updated once all have been satisfied.85004Invalid connection id providedThe connection id provided is invalid.85005Invalid messaging profile id providedThe messaging profile id provided is invalid.85006The phone number is already reservedThe phone number `{number}` is already reserved.85007Reservation limit exceededYou have too many active phone number reservations.85008Reservation extension limit exceededThe reservation has reached its limit of allowed extensions.90000Invalid value for formatFormat must be of type 'string' with a value of either 'mp3' or 'wav'.90001Invalid value for channelsChannels must be a 'string' with a value of either 'single' or 'dual'.90002Invalid value for timeoutThe 'timeout' parameter must be an 'integer' with a minimum and a maximum value accepted by command90003Invalid value for inter_digit_timeoutThe 'inter_digit_timeout' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 120000.90004Invalid value for minThe 'min' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 128.90005Invalid value for maxThe 'max' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 128.90006Invalid value for triesThe 'tries' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 128.90007Invalid value for terminating_digitThe 'terminating_digit' parameter must be a 'string' with a value of 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, *, or #.90008Invalid value for valid_digitsThe 'valid_digits' parameter must be a 'string' with a value of 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, *, or #.90009Invalid value for loopThe 'loop' parameter must either be 'infinity' or an 'integer' with a minimum value of 1 and a maximum value of 100.90010Invalid value for payloadThe 'payload' parameter should contain between 1 and 5000 characters.90011Invalid value for payload_typeThe 'payload_type' parameter must be of type 'string' with a value of either text or ssml.90012Invalid value for voiceThe 'voice' parameter must be 'female' or 'male' when using the en-US language.90013Invalid value for languageThe 'language' parameter must be of type 'string' with a value of either de-DE, en-AU, en-GB, en-US, es-ES, fr-CA, fr-FR, it-IT, ja-JP, ko-KR, nl-NL, pt-BR, sv-SE or tr-TR.90014Invalid value for digitsThe 'digits' parameter must be a 'string' made of a combination of either 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, w, W, * or #.90015Invalid Call Control IDThe provided call_control_id was not valid.90016Invalid value for stopThe 'stop' parameter must be a 'string' with a value of 'all', 'current' or 'overlay'.90017Invalid value for client_stateThe 'client_state' parameter must be a valid base64 string.90018Call has already endedThis call is no longer active and can't receive commands.90019Conference has already endedThis conference is no longer active and can't receive commands.90020Call recording triggered before audio startedCall recording cannot be started until audio has commenced on the call.90021Invalid value for durationThe 'duration' parameter must be an 'integer' with a minimum value of 100 and a maximum value of 500.90022Invalid value for minimum_digitsThe 'minimum_digits' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 128.90023Invalid value for maximum_digitsThe 'maximum_digits' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 128.90024Invalid value for maximum_triesThe 'maximum_tries' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 128.90025Invalid value for timeout_millisThe 'timeout_millis' parameter must be an 'integer' with a minimum and a maximum value accepted by command90026Invalid value for inter_digit_timeout_millisThe 'inter_digit_timeout_millis' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 120000.90027Invalid value for duration_millisThe 'duration_millis' parameter must be an 'integer' with a minimum value of 100 and a maximum value of 500.90028Invalid value for timeout_secsThe 'timeout_secs' parameter must be an 'integer' with a minimum and a maximum value accepted by command90029Invalid value for time_limit_secsThe 'time_limit_secs' parameter must be an 'integer' with a minimum value of 60 and a maximum value of 14,000.90030Invalid value for service_levelThe 'service_level' parameter must be of type 'string' with a value of either 'basic' or 'premium'.90031Call is not currently forkedCan't stop forking, because the call isn't currently forked.90032Too many conference participantsThe participant is unable to join because the maximum number of participants (`{num}` ) has been reached.90033Conference has no active participantsThis conference does not have any active participants.90034Call has not been answered yetThis call can't receive this command because it has not been answered yet.90035Call not in queueThis call can't receive this command because it has not been put in any queue yet.90036Queue fullThe queue is full and can't accept more calls.90037Queue max_size cannot be modifiedQueue exists and max_size cannot be modified.90038Call already in queueCall can't be added to a queue it's already in.90040Downloading audio file failedProvided audio file couldn't be downloaded due to a timeout.90041User termination channels limit exceededThe limit of simultaneous termination channels configured to your user has been reached.90042Outbound voice profile channels limit exceededThe limit of simultaneous channels configured to the outbound voice profile associated to this connection has been reached.90043Connection outbound channels limit exceededThe limit of simultaneous outbound channels configured to this call control connection has been reached.90044Conference join not allowedParticipant must not join the same conference twice.90045Media Streaming is used.This command can't be issued when media streaming is used.90046Media Streaming Failed.The media streaming failed to start.90048Media Streaming is not used.This command can only be issued when media streaming is used.90049Invalid value for record_timeout_secsThe 'record_timeout_secs' parameter must be an 'integer' with a minimum value of 0.90053Call recording triggered with 'timeout_secs' while transcribingCall recording can not be started with 'timeout_secs' while the call is being transcribed.90054Call Transcription is already in progressCall Transcription can not be started more than once.90055Call transcription can not be stoppedCall transcription can not be stopped while there is a recording with 'timeout_secs' in progress.90056Invalid value for initial_timeout_millisThe 'initial_timeout_millis' parameter must be an 'integer' with a minimum value of 1 and a maximum value of 120000.90057Invalid call control event type for webhook_urlsThe webhook_urls json keys must be valid call control event types.90058Invalid conference_idThe conference does not exist.90059Invalid value for recording_trackThe 'recording_track' parameter must be a 'string' with a value of either 'inbound', 'outbound' or 'both'.90080Cannot issue a command on fax in the current state.This command can only be issued when a fax is in either queued, media.processed or sending state.90081Cannot issue command for inbound fax.This command can only be issued for outbound fax.90100Notification key is invalidThe notification key provided is invalid.90101Notification context is invalidThe required notification context was either invalid or not included in the request.90102Command is invalidCall answer command cannot be issued for outbound calls.100001Invalid Dialogflow APIThe value should be either 'es' or 'cx'
