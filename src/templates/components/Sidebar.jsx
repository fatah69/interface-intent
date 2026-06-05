import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Braces, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { api } from '../../api/client';
import { moduleByRoute, modules, navGroups, routeByModule } from '../../config/resources';

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname;
}

function canSeeItem(item, user) {
  const config = modules[item.key];
  if (config?.adminOnly && user?.role?.name !== 'admin') return false;
  return true;
}

function NavButton({ item, active, data, user, navigate, openBranches, onToggleBranch, nested = false }) {
  const config = modules[item.key];
  if (!canSeeItem(item, user)) return null;

  const Icon = config.icon;
  const visibleChildren = (item.children || []).filter((child) => canSeeItem(child, user));
  const hasChildren = visibleChildren.length > 0;
  const isOpen = openBranches[item.key] ?? false;
  const ToggleIcon = isOpen ? ChevronDown : ChevronRight;
  const canRead = api.can(item.key, 'read');
  const showCount = !['chat', 'vectorCollections'].includes(item.key);
  const countLabel = canRead ? String(data[item.key]?.length || 0) : '-';

  function selectItem() {
    navigate(routeByModule[item.key]);
    if (hasChildren && !isOpen) onToggleBranch(item.key);
  }

  function toggleSubmenu(event) {
    event.stopPropagation();
    onToggleBranch(item.key);
  }

  return (
    <div className={nested ? 'nav-branch nested' : 'nav-branch'}>
      <button className={`${active === item.key ? 'nav-item active' : 'nav-item'}${hasChildren ? ' has-children' : ''}`} onClick={selectItem} type="button">
        <Icon size={18} />
        <span>{config.title}</span>
        {showCount && <small title={canRead ? `${countLabel} records loaded` : 'List endpoint unavailable'}>{countLabel}</small>}
        {hasChildren && (
          <span className="nav-chevron" onClick={toggleSubmenu} title={isOpen ? 'Hide submenu' : 'Show submenu'}>
            <ToggleIcon size={15} />
          </span>
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="sub-nav">
          {visibleChildren.map((child) => (
            <NavButton
              key={child.key}
              item={child}
              active={active}
              data={data}
              user={user}
              navigate={navigate}
              openBranches={openBranches}
              onToggleBranch={onToggleBranch}
              nested
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ data, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = moduleByRoute[normalizePath(location.pathname)] || 'intents';
  const [openGroups, setOpenGroups] = useState({ 'AI-Configuration': true });
  const [openBranches, setOpenBranches] = useState({ actions: true });

  function toggleGroup(title) {
    setOpenGroups((current) => ({ ...current, [title]: !(current[title] ?? true) }));
  }

  function toggleBranch(key) {
    setOpenBranches((current) => ({ ...current, [key]: !(current[key] ?? false) }));
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Braces size={22} /></div>
        <div>
          <strong>Intent & Agent</strong>
          <span>Management Console</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <section className="nav-section" key={group.title}>
            <button className="nav-section-toggle" type="button" onClick={() => toggleGroup(group.title)}>
              <span>{group.title}</span>
              {(openGroups[group.title] ?? true) ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
            {(openGroups[group.title] ?? true) && group.items.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={active}
              data={data}
              user={user}
              navigate={navigate}
              openBranches={openBranches}
              onToggleBranch={toggleBranch}
              />
            ))}
          </section>
        ))}
      </nav>

      <div className="sidebar-session">
        <div>
          <strong>{user?.username || 'User'}</strong>
          <span>{user?.role?.name || `Role #${user?.role_id || '-'}`}</span>
        </div>
        <button className="ghost-button" type="button" onClick={onLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>

    </aside>
  );
}
