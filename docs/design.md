# lavacahacemu.com
## Database
### Blog Post
```mermaid
classDiagram
class BlogPost{
    string date
    string language
    string content
    string backgroundImage
    string author
    List~string~ tags
}

```
* **Date**
* **Content**
* **Language**
* **backgroundImage** 
* **Author**

### Navigation

## Generation

```mermaid
graph TD;
    A(start);
    B[Sanity Check];
    C[Generate Directory];
    D[Generate Image];
    E[Generate HTML];

    A-->B;
    B-->C;
    C-->D;
    D-->E;
```