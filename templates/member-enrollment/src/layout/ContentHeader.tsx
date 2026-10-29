export default function ContentHeader({
  title,
  breadcrumb,
}: {
  title: string
  breadcrumb: string[]
}) {
  return (
    <div className="app-content-header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            <h1 className="h3 mb-0">{title}</h1>
          </div>
          <div className="col-sm-6">
            <ol className="breadcrumb float-sm-end">
              {breadcrumb.map((item, index) =>
                index === breadcrumb.length - 1 ? (
                  <li
                    className="breadcrumb-item active"
                    aria-current="page"
                    key={item}
                  >
                    {item}
                  </li>
                ) : (
                  <li className="breadcrumb-item" key={item}>
                    {item}
                  </li>
                ),
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
