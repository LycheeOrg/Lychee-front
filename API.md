# API Functions

The current API provide the following calls to `php/index.php` as `POST` requests

|      Function           |  Arguments  |   Action    |
|:------------------------|:------------|:------------|
| `Session::init`         |                                                   |             |
| `Session::login`        | `user`, `password`                                |             |
| `Session::logout`       |                                                   |             |
| `Albums::get`           |                                                   |             |
| `Album::get`            | `albumID`                                         |             |
| `Album::getPublic`      | `albumID`                                         |             |
| `Album::add`            | `title`                                           |             |
| `Album::setTitle`       | `albumIDs`, `title`                               |             |
| `Album::setDescription` | `albumID`, `description`                          |             |
| `Album::setPublic`      | `albumID`, `password`, `visible`, `downloadable`  |             |
| `Album::delete`         | `albumIDs`                                        |             |
| `Album::merge`          | `albumIDs`                                        |             |
| `Photo::get`            | `albumID`, `photoID`                              |             |
| `Photo::setTitle`       | `photoIDs`, `title`                               |             |
| `Photo::setDescription` | `photoID`, `description`                          |             |
| `Photo::setStar`        | `photoIDs`                                        |             |
| `Photo::setPublic`      | `photoID`                                         |             |
| `Photo::setAlbum`       | `photoIDs`, `albumID`                             |             |
| `Photo::setTags`        | `photoIDs`, `tags`                                |             |
| `Photo::add`            | `albumID`, `0`, `0.*`                             |             |
| `Photo::delete`         | `photoIDs`                                        |             |
| `Photo::duplicate`      | `photoIDs`                                        |             |
| `Settings::setLogin`    | `username`, `password`                            |             |
| `Settings::setSorting`  | `typeAlbums`, `orderAlbums`, `typePhotos`, `orderPhotos`            |             |
